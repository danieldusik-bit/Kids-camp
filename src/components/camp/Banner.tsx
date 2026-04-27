"use client";

export function Banner() {
  return (
    <header className="relative w-full bg-tint">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 pt-6 lg:pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner.jpeg?v=2"
          alt="Летние лагеря ц. Храм Спасения 2026"
          className="block w-full h-auto rounded-3xl border border-line shadow-[0_4px_24px_rgba(60,40,20,0.05)]"
        />
      </div>
    </header>
  );
}
