"use client";

export function Banner() {
  return (
    <header className="relative w-full max-h-80 overflow-hidden bg-tint">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/banner.jpeg?v=2"
        alt="Летние лагеря ц. Храм Спасения 2026"
        className="block w-full h-auto max-h-80 object-cover object-center"
      />
    </header>
  );
}
