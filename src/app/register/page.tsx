"use client";
import { Banner } from "@/components/camp/Banner";
import { SideNav } from "@/components/camp/SideNav";
import { Footer } from "@/components/camp/Footer";
import { Success } from "@/components/camp/Success";
import { StepParent } from "@/components/camp/steps/StepParent";
import { StepChild } from "@/components/camp/steps/StepChild";
import { StepHealth } from "@/components/camp/steps/StepHealth";
import { StepBilling } from "@/components/camp/steps/StepBilling";
import { StepConfirm } from "@/components/camp/steps/StepConfirm";
import { useCampForm } from "@/lib/camp/useCampForm";
import { CAMP, STEPS } from "@/lib/camp/camp";

const HEADERS = [
  {
    eyebrow: "Шаг 1 из 5 · Родитель",
    title: "Контакты родителя",
    lede: "Эти данные нужны, чтобы связаться с вами по поводу заявки и в дни смены.",
  },
  {
    eyebrow: "Шаг 2 из 5 · Ребёнок",
    title: "Кто едет в лагерь",
    lede: "Расскажите про ребёнка — мы соберём группу по возрасту и языку общения.",
  },
  {
    eyebrow: "Шаг 3 из 5 · Здоровье",
    title: "Здоровье и привычки",
    lede: "Эта информация видна только медсестре и старшему вожатому. Мы относимся к ней бережно.",
  },
  {
    eyebrow: "Шаг 4 из 5 · Реквизиты",
    title: "Оплата и счёт",
    lede: "Стоимость одной смены. Счёт придёт на e-mail в течение 2 рабочих дней.",
  },
  {
    eyebrow: "Шаг 5 из 5 · Подтверждение",
    title: "Последний шаг",
    lede: "Проверьте данные и подтвердите согласие, чтобы мы могли забронировать место.",
  },
];

export default function RegisterPage() {
  const form = useCampForm();
  const { stepIdx, goNext, goPrev, goTo, submit, submitted, submitting, data } =
    form;
  const isLast = stepIdx === STEPS.length - 1;
  const head = HEADERS[stepIdx];

  return (
    <main className="min-h-screen bg-bg">
      <Banner />
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-8 lg:py-10">
        {/* Brand strip */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent text-white grid place-items-center font-display font-semibold">
              К
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-lg text-ink leading-none">
                {CAMP.name}
              </span>
              <span className="text-xs text-ink-mute mt-1">{CAMP.edition}</span>
            </div>
          </div>
          <a
            href="tel:+37126809250"
            className="text-sm text-ink-soft hover:text-accent-strong transition-colors hidden sm:inline"
          >
            Помощь · +371 26809250
          </a>
        </div>

        <div className="grid lg:grid-cols-[248px_1fr] grid-cols-1 gap-6 lg:gap-8 items-start">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block">
            <SideNav current={stepIdx} onJump={goTo} />
          </div>

          {/* Mobile step strip */}
          <div className="lg:hidden flex gap-1.5 overflow-x-auto -mx-1 px-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                disabled={i > stepIdx}
                onClick={() => i <= stepIdx && goTo(i)}
                className={[
                  "flex-shrink-0 px-3 h-9 rounded-full text-xs font-semibold border transition-all",
                  i === stepIdx
                    ? "bg-accent text-white border-accent"
                    : i < stepIdx
                    ? "bg-tint text-accent-strong border-accent-soft"
                    : "bg-surface text-ink-mute border-line",
                ].join(" ")}
              >
                <span className="opacity-70 mr-1.5">{s.short}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <section className="bg-surface rounded-3xl border border-line shadow-[0_4px_24px_rgba(60,40,20,0.05)] p-6 sm:p-9 lg:p-10">
            {submitted ? (
              <Success data={data} />
            ) : (
              <>
                <header className="mb-7">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-accent font-bold mb-2">
                    {head.eyebrow}
                  </div>
                  <h2 className="font-display text-[28px] sm:text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-ink m-0">
                    {head.title}
                  </h2>
                  <p className="text-[15px] text-ink-soft mt-2.5 mb-0 max-w-[560px]">
                    {head.lede}
                  </p>
                </header>

                {stepIdx === 0 && <StepParent form={form} />}
                {stepIdx === 1 && <StepChild form={form} />}
                {stepIdx === 2 && <StepHealth form={form} />}
                {stepIdx === 3 && <StepBilling form={form} />}
                {stepIdx === 4 && <StepConfirm form={form} />}

                <Footer
                  stepIdx={stepIdx}
                  isLast={isLast}
                  onPrev={goPrev}
                  onNext={goNext}
                  onSubmit={submit}
                  submitting={submitting}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
