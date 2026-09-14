"use client";

import { useEffect, useState } from "react";
import { useField, useFormFields } from "@payloadcms/ui";
import { CropPreview } from "./CropPreview";

type Loaded = {
  id: string;
  url: string | null;
  focalX: number | null;
  focalY: number | null;
  whole: boolean;
};

/**
 * Sets where the hero picture is cropped on the index by clicking the picture,
 * rather than by typing two percentages.
 *
 * It writes into the same indexFocal.x / indexFocal.y the field already stores,
 * so nothing about the data or the schema changes — this is only a nicer way to
 * fill them in. Until a point is chosen here, the previews show the crop the
 * index really uses: the point set on the picture itself.
 */
export const IndexFocalField = () => {
  const { value: x, setValue: setX } = useField<number>({ path: "indexFocal.x" });
  const { value: y, setValue: setY } = useField<number>({ path: "indexFocal.y" });

  const heroValue = useFormFields(([fields]) => fields?.heroImage?.value);

  // An unsaved upload arrives as an object, a saved one as its id.
  const raw =
    typeof heroValue === "object" && heroValue !== null
      ? (heroValue as { id?: number | string }).id
      : heroValue;
  const heroId = raw === undefined || raw === null || raw === "" ? null : String(raw);

  // Kept together with the id it belongs to, so a stale picture is never shown
  // for a newly chosen one — and so the effect never has to clear state.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!heroId) return;

    let cancelled = false;
    fetch(`/api/media/${heroId}?depth=0`)
      .then((response) => (response.ok ? response.json() : null))
      .then((doc) => {
        if (cancelled) return;
        setLoaded({
          id: heroId,
          url: doc?.url ?? null,
          focalX: typeof doc?.focalX === "number" ? doc.focalX : null,
          focalY: typeof doc?.focalY === "number" ? doc.focalY : null,
          whole: doc?.showWhole === true,
        });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: heroId, url: null, focalX: null, focalY: null, whole: false });
      });

    return () => {
      cancelled = true;
    };
  }, [heroId]);

  const doc = loaded && loaded.id === heroId ? loaded : null;
  const isSet = typeof x === "number" && typeof y === "number";
  const px = isSet ? x : (doc?.focalX ?? 50);
  const py = isSet ? y : (doc?.focalY ?? 50);

  const clear = () => {
    setX(undefined as unknown as number);
    setY(undefined as unknown as number);
  };

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
        Izrez naslovne slike na prvi strani
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12, opacity: 0.7, maxWidth: 560 }}>
        {doc?.whole
          ? "Naslovna slika je označena, da se pokaže cela, zato se tudi na prvi strani ne obreže."
          : "Klikni na sliko in izberi točko, ki naj ostane vidna v mreži na prvi strani. Spodaj vidiš, kako jo bo obrezal vsak okvir. Če ne izbereš ničesar, velja točka, izbrana pri sami sliki."}
      </p>

      {!heroId && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
          Najprej izberi naslovno sliko, potem lahko določiš izrez.
        </p>
      )}

      {heroId && !doc?.url && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Nalagam sliko …</p>
      )}

      {doc?.url && (
        <>
          <CropPreview
            url={doc.url}
            x={px}
            y={py}
            whole={doc.whole}
            onPick={(nx, ny) => {
              setX(nx);
              setY(ny);
            }}
          />

          {!doc.whole && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                {isSet ? `${x}% / ${y}%` : "Uporablja točko, izbrano pri sliki"}
              </span>
              {isSet && (
                <button
                  type="button"
                  onClick={clear}
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
                  Počisti
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
