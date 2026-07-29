import "server-only";
import { getPayloadClient } from "./payload";

export async function getSettings() {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "settings" });
}

export async function getHome() {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "home" });
}

export async function getAbout() {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "about", depth: 1 });
}
