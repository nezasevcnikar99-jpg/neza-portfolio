"use client";

import { useEffect, useState } from "react";
import { useField, useFormFields } from "@payloadcms/ui";

type Loaded = { id: string; url: string | null };

/**
 * Sets where the hero picture is cropped on the index by clicking the picture,
 * rather than by typing two percentages.
 *
 * It writes into the same indexFocal.x / indexFocal.y the field already stores,
 * so nothing about the data or the schema changes — this is only a nicer way to
 * fill them in. Where there is no hero picture yet, it says so instead of
 * showing an empty frame.
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
        if (!cancelled) setLoaded({ id: heroId, url: doc?.url ?? null });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: heroId, url: null });
      });

    return () => {
      cancelled = true;
    };
  }, [heroId]);

  const url = loaded && loaded.id === heroId ? loaded.url : null;
  const isSet = typeof x === "number" && typeof y === "number";

  const place = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
    setX(clamp(((event.clientX - box.left) / box.width) * 100));
    setY(clamp(((event.clientY - box.top) / box.height) * 100));
  };

  const clear = () => {
    setX(undefined as unknown as number);
    setY(undefined as unknown as number);
  };

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
        Izrez naslovne slike na prvi strani
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12, opacity: 0.7, maxWidth: 520 }}>
        Klikni na sliko in izberi točko, ki naj ostane vidna v mreži na prvi strani. Če ne izbereš
        ničesar, velja izrez, nastavljen pri sami sliki.
      </p>

      {!heroId && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
          Najprej izberi naslovno sliko, potem lahko določiš izrez.
        </p>
      )}

      {heroId && !url && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Nalagam sliko …</p>
      )}

      {url && (
        <>
          <div
            onClick={place}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              aspectRatio: "1",
              overflow: "hidden",
              cursor: "crosshair",
              border: "1px solid var(--theme-elevation-150, #ccc)",
              borderRadius: 3,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${isSet ? x : 50}% ${isSet ? y : 50}%`,
                userSelect: "none",
              }}
            />
            {isSet && (
              <span
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: 16,
                  height: 16,
                  marginLeft: -8,
                  marginTop: -8,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.55)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              {isSet ? `${x}% / ${y}%` : "Uporablja izrez slike"}
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
        </>
      )}
    </div>
  );
};
