/**
 * Puts the contents of content/projects into a live site.
 *
 * One Markdown file per project, pictures beside it in content/images. The
 * script logs in as the administrator, uploads whatever pictures are missing,
 * and creates or updates the project — so the same file can be imported again
 * after an edit without making a second copy of anything.
 *
 * Nothing is deleted, ever.
 *
 *   npm run import                     — into the live site, asks for the password
 *   npm run import -- --dry-run        — says what it would do, changes nothing
 *   npm run import -- --site http://localhost:3000
 *   npm run import -- --only hisa-ob-reki
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};
const has = (name) => args.includes(`--${name}`);

const SITE = (flag("site", "https://neza-portfolio.vercel.app")).replace(/\/$/, "");
const ONLY = flag("only", null);
const DRY = has("dry-run");

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const IMAGES_DIR = path.join(process.cwd(), "content", "images");

/* ---------- the file format ---------- */

/**
 * Front matter is deliberately simpler than YAML: `key: value` lines, plus a
 * `galerija:` block of indented lines shaped
 *   filename | stran|galerija | caption
 * so nothing depends on getting indentation exactly right.
 */
function parse(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: manjka glava med vrsticama ---`);

  const [, head, body] = match;
  const meta = {};
  const gallery = [];
  let inGallery = false;

  for (const raw of head.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;

    if (/^\s/.test(raw) && inGallery) {
      const [name, where, ...rest] = raw.split("|").map((part) => part.trim());
      if (!name) continue;
      gallery.push({
        file: name,
        onPage: !/^galerij/i.test(where ?? ""),
        caption: rest.join("|").trim() || null,
      });
      continue;
    }

    const at = raw.indexOf(":");
    if (at === -1) throw new Error(`${file}: nerazumljiva vrstica v glavi — ${raw}`);
    const key = raw.slice(0, at).trim();
    const value = raw.slice(at + 1).trim();
    if (key === "galerija") {
      inGallery = true;
      continue;
    }
    inGallery = false;
    meta[key] = value;
  }

  // The prose: everything before "## Koncept" is the introduction, the rest is
  // the concept.
  const split = body.split(/^##\s*Koncept\s*$/im);
  const intro = split[0].trim();
  const concept = (split[1] ?? "").trim();

  return { meta, gallery, intro, concept };
}

const paragraphs = (text) =>
  text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);

/** The shape Payload's editor stores; plain paragraphs are all we need. */
const lexical = (text) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: paragraphs(text).map((line) => ({
      type: "paragraph",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      textFormat: 0,
      children: [
        { type: "text", text: line, format: 0, style: "", mode: "normal", detail: 0, version: 1 },
      ],
    })),
  },
});

/** 1 slika, 2 sliki, 3 slike, 5 slik — the dual matters here. */
const pictures = (n) => {
  const form = n % 100 === 1 ? "slika" : n % 100 === 2 ? "sliki" : n % 100 === 3 || n % 100 === 4 ? "slike" : "slik";
  return `${n} ${form}`;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ---------- talking to the site ---------- */

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Keeps the password off the screen; it is never written anywhere.
      rl._writeToOutput = (chunk) => {
        if (chunk.includes(question)) rl.output.write(chunk);
      };
    }
    rl.question(question, (answer) => {
      if (hidden) rl.output.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function call(token, endpoint, init = {}) {
  const response = await fetch(`${SITE}${endpoint}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${endpoint} → ${response.status} ${text.slice(0, 300)}`);
  }
  return json;
}

/** Uploads a picture unless one with that filename is already there. */
async function mediaId(token, filename, alt, cache) {
  if (cache.has(filename)) return cache.get(filename);

  const found = await call(token, `/api/media?where[filename][equals]=${encodeURIComponent(filename)}&limit=1`);
  if (found?.docs?.length) {
    cache.set(filename, found.docs[0].id);
    return found.docs[0].id;
  }

  const full = path.join(IMAGES_DIR, filename);
  await stat(full).catch(() => {
    throw new Error(`slike ni v content/images: ${filename}`);
  });

  if (DRY) {
    console.log(`   + naložil bi sliko ${filename}`);
    cache.set(filename, `<${filename}>`);
    return cache.get(filename);
  }

  const body = new FormData();
  body.append("file", new Blob([await readFile(full)]), filename);
  body.append("_payload", JSON.stringify({ alt }));
  const created = await call(token, "/api/media", { method: "POST", body });
  const id = created?.doc?.id;
  console.log(`   + slika ${filename}`);
  cache.set(filename, id);
  return id;
}

/* ---------- the run ---------- */

const files = (await readdir(PROJECTS_DIR).catch(() => []))
  .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
  .sort();

if (files.length === 0) {
  console.log("V content/projects ni nobene datoteke .md — ni kaj uvoziti.");
  process.exit(0);
}

let token = null;
if (!DRY) {
  const email = flag("email", null) ?? (await ask("E-pošta administratorja: "));
  const password = process.env.PAYLOAD_PASSWORD ?? (await ask("Geslo: ", true));
  const login = await call(null, "/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  token = login?.token;
  if (!token) throw new Error("prijava ni uspela");
  console.log(`Prijavljen v ${SITE}\n`);
} else {
  console.log(`Suhi tek proti ${SITE} — nič se ne bo spremenilo.\n`);
}

const cache = new Map();

for (const name of files) {
  try {
    await importOne(name);
  } catch (error) {
    console.error(`\n${name}: ${error.message}\n`);
    process.exitCode = 1;
  }
}

console.log("Končano.");

async function importOne(name) {
  const source = await readFile(path.join(PROJECTS_DIR, name), "utf8");
  const { meta, gallery, intro, concept } = parse(source, name);

  const title = meta.naslov;
  if (!title) throw new Error(`${name}: manjka "naslov"`);
  const slug = meta.slug || slugify(title);
  if (ONLY && ONLY !== slug) return;

  console.log(`${slug} — ${title}`);

  const data = {
    title,
    slug,
    subtitle: meta.podnaslov || null,
    category: meta.kategorija || "Arhitektura",
    year: meta.leto ? Number(meta.leto) : new Date().getFullYear(),
    quote: meta.citat || null,
    stranka: meta.stranka || null,
    vloga: meta.vloga || null,
    imgLabel: meta.oznaka || null,
    intro: intro || null,
    ...(meta.vrstniRed ? { order: Number(meta.vrstniRed) } : {}),
    ...(concept ? { concept: lexical(concept) } : {}),
  };

  if (meta.izrez) {
    const [x, y] = meta.izrez.split(/[\s,/]+/).map(Number);
    if (Number.isFinite(x) && Number.isFinite(y)) data.indexFocal = { x, y };
  }

  if (meta.naslovna) {
    data.heroImage = await mediaId(token, meta.naslovna, `${title} — naslovna`, cache);
  }

  if (gallery.length) {
    data.gallery = [];
    for (const row of gallery) {
      data.gallery.push({
        image: await mediaId(token, row.file, row.caption || title, cache),
        caption: row.caption,
        onPage: row.onPage,
      });
    }
  }

  const existing = await call(token, `/api/projects?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`);
  const doc = existing?.docs?.[0];

  if (DRY) {
    const shown = 1 + gallery.filter((row) => row.onPage).length;
    console.log(`   ${doc ? "posodobil bi" : "ustvaril bi"} — ${pictures(gallery.length)} v galeriji, ${Math.min(shown, 4)} na strani\n`);
    return;
  }

  if (doc) {
    await call(token, `/api/projects/${doc.id}`, { method: "PATCH", body: JSON.stringify(data) });
    console.log("   posodobljeno\n");
  } else {
    await call(token, "/api/projects", { method: "POST", body: JSON.stringify(data) });
    console.log("   ustvarjeno\n");
  }
}
