/**
 * Marca de agua de fondo, visible en todas las pantallas EXCEPTO login.
 * Usa la imagen en /public/watermark.png (subila vos con ese nombre exacto).
 */
export function Watermark() {
  return (
    <img
      src="/watermark.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 m-auto hidden h-72 w-72 select-none object-contain opacity-[0.06] md:block"
    />
  );
}
