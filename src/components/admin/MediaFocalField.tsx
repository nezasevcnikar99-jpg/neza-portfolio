"use client";

import { useEffect, useState } from "react";
import { useDocumentInfo, useField, useFormFields } from "@payloadcms/ui";
import { CropPreview } from "./CropPreview";

type Loaded = { id: string; url: string | null; image: boolean };

/**
 * Chooses the part of a picture that stays in view, on the picture's own page
 * in the admin, with every frame the site cuts it to shown beneath.
 *
 * It writes Payload's own focalX / focalY, so the choice is the one the site
 * already reads — this only makes it visible while it is being made.
 */
export const MediaFocalField = () => {
  const { id } = useDocumentInfo();
  const { value: x, setValue: setX } = useField<number>({ path: "focalX" });
  const { value: y, setValue: setY } = useField<number>({ path: "focalY" });
  const whole = useFormFields(([fields]) => fields?.showWhole?.value) === true;

  const docId = id === undefined || id === null ? null : String(id);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  // The saved document is asked for its address rather than the form, because
  // with pictures kept in Blob that address is only settled once it is saved.
  useEffect(() => {
    if (!docId) return;

    let cancelled = false;
    fetch(`/api/media/${docId}?depth=0`)
      .then((response) => (response.ok ? response.json() : null))
      .then((doc) => {
        if (cancelled) return;
        setLoaded({ id: docId, url: doc?.url ?? null, image: String(doc?.mimeType ?? "").startsWith("image/") });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: docId, url: null, image: false });
      });

    return () => {
      cancelled = true;
    };
  }, [docId]);

  const doc = loaded && loaded.id === docId ? loaded : null;
  if (doc && !doc.image) return null;

  const px = typeof x === "number" ? x : 50;
  const py = typeof y === "number" ? y : 50;

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Kateri del slike ostane viden</div>
      <p style={{ margin: "0 0 10px", fontSize: 12, opacity: 0.7, maxWidth: 560 }}>
        {whole
          ? "Slika je označena, da se pokaže cela – v vsakem okvirju je vsa, na svetli podlagi, zato točke ni treba izbirati."
          : "Klikni na sliko, kjer je tisto, kar mora ostati. Spodaj vidiš, kako jo bo stran obrezala v vsakem okvirju. Velja povsod, kjer se slika pojavi, razen na prvi strani, če ima projekt tam svoj izrez."}
      </p>

      {!docId && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Ko sliko naložiš in shraniš, tu izbereš, kateri del naj ostane viden.</p>
      )}
      {docId && !doc && <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Nalagam sliko …</p>}

      {doc?.url && (
        <>
          <CropPreview
            url={doc.url}
            x={px}
            y={py}
            whole={whole}
            onPick={(nx, ny) => {
              setX(nx);
              setY(ny);
            }}
          />
          {!whole && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                {px}% / {py}%
              </span>
              {(px !== 50 || py !== 50) && (
                <button
                  type="button"
                  onClick={() => {
                    setX(50);
                    setY(50);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  Na sredino
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
