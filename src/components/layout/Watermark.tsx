"use client";

/**
 * Marca de agua de fondo, visible en todas las pantallas EXCEPTO login.
 * Usa la imagen en /public/watermark.png (subila con ese nombre exacto).
 * Si el archivo no existe todavía, el onError la oculta en vez de mostrar
 * el ícono de "imagen rota". Lleva "use client" porque onError es un
 * event handler, y esos no se pueden usar en un Server Component.
 */
export function Watermark() {
  return (
    <img
      src="/watermark.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-64 w-64 max-w-[70vw] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-10"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
