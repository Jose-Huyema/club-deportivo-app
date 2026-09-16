"use client";

/**
 * Client Component chico solo para poder usar onError (event handler).
 * Recibe únicamente strings desde el Server Component padre — nunca hay
 * que pasarle una función como prop, por eso el handler se define acá adentro.
 */
export function LogoImage({ alt }: { alt: string }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className="mx-auto mb-3 h-20 w-20 object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
