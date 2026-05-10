"use client";
import { useMemo, useState } from "react";
import {
  AutoTextarea,
  PageFooter,
  PrintButton,
  ProgressBar,
  ResetButton,
} from "../_components/primitives";
import { useChecklistState } from "../_components/useChecklistState";

// ── Types ───────────────────────────────────────────────────────────────────
type Goal = { name: string; amount: string; deadline: string };

type State = {
  // Финансы
  p1income1: string; p1income2: string; p1expense: string; p1personal: string;
  p2income1: string; p2income2: string; p2expense: string; p2personal: string;
  // Чувства
  p1feeling: string; p1surprised: string; p1fear: string;
  p2feeling: string; p2surprised: string; p2fear: string;
  // Кто за что платит
  agreeRent: string; agreeFood: string; agreeKids: string;
  agreeUtils: string; agreeOther: string;
  // Правила
  freeAmount: string; whenTalk: string; talkRule: string;
  // Цели
  goals: Goal[];
  // Долг
  debtName: string; debtAmount: string;
  // Остальное
  cutsTogether: string; sharedDream: string;
  // Неделя
  weekDone: boolean[];
  // Подписи
  p1SignatureName: string; p1SignatureDate: string;
  p2SignatureName: string; p2SignatureDate: string;
};

const INITIAL: State = {
  p1income1: "", p1income2: "", p1expense: "", p1personal: "",
  p2income1: "", p2income2: "", p2expense: "", p2personal: "",
  p1feeling: "", p1surprised: "", p1fear: "",
  p2feeling: "", p2surprised: "", p2fear: "",
  agreeRent: "", agreeFood: "", agreeKids: "", agreeUtils: "", agreeOther: "",
  freeAmount: "", whenTalk: "", talkRule: "",
  goals: [{ name: "", amount: "", deadline: "" }],
  debtName: "", debtAmount: "",
  cutsTogether: "", sharedDream: "",
  weekDone: [false, false, false, false],
  p1SignatureName: "", p1SignatureDate: "",
  p2SignatureName: "", p2SignatureDate: "",
};

const TOTAL_SECTIONS = 5;
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// ── Helpers ─────────────────────────────────────────────────────────────────
function num(v: string) { return parseFloat(v) || 0; }
function fmtRub(n: number) {
  return (n >= 0 ? "" : "-") + Math.abs(n).toLocaleString("ru-RU") + " ₽";
}
function fmtBalance(n: number) {
  return (n >= 0 ? "+" : "") + n.toLocaleString("ru-RU") + " ₽";
}
function formatSignatureDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CoverPage() {
  return (
    <section
      id="p1"
      className="cover-page rounded-2xl overflow-hidden mb-10"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, #5e2a91 0%, #3b1768 55%, #2a0e52 100%)",
        color: "#fff",
        padding: "60px 40px",
        textAlign: "center",
      }}
    >
      <div className="mb-7" style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={`${PUBLIC_BASE_PATH}/logo-nalich.png`}
          alt="НаЛичность"
          className="cover-logo"
        />
      </div>
      <div style={{ marginBottom: "20px", marginTop: "36px" }}>
        <span className="pill-gold" style={{ fontSize: "20px", padding: "10px 32px" }}>«Чек-лист»</span>
      </div>
      <h1 style={{ fontFamily: "var(--font-forum), serif", fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, fontWeight: 400, margin: "0", maxWidth: "720px", marginInline: "auto" }}>
        «Семейный финансовый договор»
      </h1>
      <p className="sans mt-4 opacity-80" style={{ fontSize: "18px", maxWidth: "36rem", margin: "1rem auto 0" }}>
        Заполняйте вместе. Аудит денег и чувств, взрослые договорённости и общий план на 90 дней.
      </p>
      <p className="sans italic mt-12 opacity-80">
        <a href="https://www.instagram.com/MethodBataeva" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>@MethodBataeva</a>
      </p>
    </section>
  );
}

function NavBar({ progress, open, setOpen }: { progress: number; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <nav className="top-dock no-print">
      <div className="top-dock-inner">
        <div className="top-dock-head sans">
          <a href="#p1" className="toc-link brand-link">Семейный договор</a>
          <div className="top-dock-actions">
            <span>{progress}% заполнено</span>
            <button
              type="button"
              className="menu-toggle"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        <div className="section-tabs" data-open={open}>
          <a href="#p2" className="toc-link" onClick={() => setOpen(false)}>Финансы</a>
          <a href="#p3" className="toc-link" onClick={() => setOpen(false)}>Чувства</a>
          <a href="#p4" className="toc-link" onClick={() => setOpen(false)}>Договорённости</a>
          <a href="#p5" className="toc-link" onClick={() => setOpen(false)}>90 дней</a>
          <a href="#p6" className="toc-link" onClick={() => setOpen(false)}>Неделя</a>
        </div>
      </div>
    </nav>
  );
}

function SectionHeader({ title, done, total, label = "заполнено", hideBar = false }: { title: string; done: number; total: number; label?: string; hideBar?: boolean }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <h2 className="h1" style={{ margin: 0 }}>{title}</h2>
        {done > 0 && (
          <span className="sans" style={{ fontSize: "13px", color: done === total ? "#2E9E6E" : "var(--c-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            {done === total ? "Готово" : `${done} / ${total} ${label}`}
          </span>
        )}
      </div>
      {!hideBar && done > 0 && (
        <div style={{ height: "3px", background: "var(--c-purple-soft)", borderRadius: "2px", marginTop: "8px" }}>
          <div style={{ height: "100%", width: `${Math.min((done / total) * 100, 100)}%`, background: done === total ? "#2E9E6E" : "var(--c-purple)", borderRadius: "2px", transition: "width 0.3s ease" }} />
        </div>
      )}
    </div>
  );
}

// Инпут-цифра (доход/расход)
function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="num-field">
      <label className="label num-field-label">{label}</label>
      <div className="num-field-control">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className="num-field-input"
        />
        <span className="num-field-currency">₽</span>
      </div>
    </div>
  );
}

// Партнёрская карточка (финансы)
function PartnerFinanceCard({ label, avatarLetter, income1, income2, expense, personal, onChange }: {
  label: string; avatarLetter: string;
  income1: string; income2: string; expense: string; personal: string;
  onChange: (key: string, v: string) => void;
}) {
  return (
    <div className="partner-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "var(--c-purple-soft)", border: "1.5px solid var(--c-purple-line)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-forum), serif", fontSize: "15px", color: "var(--c-purple-deep)",
          flexShrink: 0,
        }}>{avatarLetter}</div>
        <span className="h2">{label}</span>
      </div>
      <NumField label="Основной доход" value={income1} onChange={v => onChange("income1", v)} />
      <NumField label="Доп. доход" value={income2} onChange={v => onChange("income2", v)} />
      <NumField label="Обязат. расходы" value={expense} onChange={v => onChange("expense", v)} />
      <NumField label="Личные расходы" value={personal} onChange={v => onChange("personal", v)} />
    </div>
  );
}

// Итоговая строка финансов
function TotalsBlock({ income, expenses, balance }: { income: number; expenses: number; balance: number }) {
  return (
    <div className="totals-grid">
      {[
        { label: "Семейный доход", val: fmtRub(income), color: "var(--c-purple-deep)" },
        { label: "Общие расходы", val: fmtRub(expenses), color: "var(--c-purple-deep)" },
        { label: "Остаток", val: fmtBalance(balance), color: balance >= 0 ? "#2e9e6e" : "#c54242" },
      ].map(({ label, val, color }) => (
        <div key={label} className="total-card">
          <div className="total-card-label">{label}</div>
          <div className="total-card-value" style={{ color }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

// Партнёрская карточка (чувства)
function PartnerFeelCard({ label, avatarLetter, feeling, surprised, fear, onChange }: {
  label: string; avatarLetter: string;
  feeling: string; surprised: string; fear: string;
  onChange: (key: "feeling" | "surprised" | "fear", v: string) => void;
}) {
  return (
    <div className="partner-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "var(--c-purple-soft)", border: "1.5px solid var(--c-purple-line)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-forum), serif", fontSize: "15px", color: "var(--c-purple-deep)",
          flexShrink: 0,
        }}>{avatarLetter}</div>
        <span className="h2">{label}</span>
      </div>
      <div className="field-row">
        <label className="label">Что я почувствовал(а)</label>
        <AutoTextarea value={feeling} onChange={v => onChange("feeling", v)} placeholder="Страх, удивление, обида, облегчение..." />
      </div>
      <div className="field-row">
        <label className="label">Что меня удивило</label>
        <AutoTextarea value={surprised} onChange={v => onChange("surprised", v)} placeholder="Не знал(а) об этом..." />
      </div>
      <div className="field-row">
        <label className="label">Страх или стыд, о котором хочу сказать</label>
        <AutoTextarea value={fear} onChange={v => onChange("fear", v)} placeholder="Я боюсь, что... / Мне стыдно, что..." minRows={1} className="field-input field-input-single" />
      </div>
    </div>
  );
}

// Строка договорённости
function AgreeRow({ question, value, onChange, placeholder, children }: {
  question: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(200,179,224,0.35)" }}>
      <div className="label" style={{ marginBottom: "8px" }}>{question}</div>
      {children ?? (
        <AutoTextarea
          value={value ?? ""}
          onChange={onChange!}
          placeholder={placeholder}
          minRows={1}
          className="field-input field-input-single"
        />
      )}
    </div>
  );
}

function SignatureCard({
  partner,
  name,
  date,
  onNameChange,
  onDateChange,
}: {
  partner: string;
  name: string;
  date: string;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
}) {
  return (
    <div className="signature-card">
      <label className="signature-partner">
        <span>{partner}</span>
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="ФИО"
          className="signature-name-input"
          autoComplete="name"
        />
      </label>
      <label className="signature-date-row">
        <span>дата:</span>
        <input
          type="text"
          value={date}
          onChange={(event) => onDateChange(formatSignatureDate(event.target.value))}
          placeholder="ДД/ММ/ГГГГ"
          className="signature-date-input"
          inputMode="numeric"
          maxLength={10}
          autoComplete="off"
          aria-label={`Дата подписи, ${partner}`}
        />
      </label>
    </div>
  );
}

// Карточка цели
function GoalCard({ n, goal, onChange, onRemove, canRemove }: {
  n: number;
  goal: Goal;
  onChange: (key: keyof Goal, v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--c-purple-line)",
      borderRadius: "16px",
      padding: "18px 20px",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="num-circle">{n}</span>
          <span className="h2">Цель {n}</span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", fontSize: "18px", lineHeight: 1, padding: "2px 6px" }}
            aria-label="Удалить цель"
          >✕</button>
        )}
      </div>
      <div className="field-row">
        <label className="label">Название цели</label>
        <AutoTextarea value={goal.name} onChange={v => onChange("name", v)} placeholder="Поездка в отпуск, ремонт, образование..." minRows={1} className="field-input field-input-single" />
      </div>
      <div className="field-row">
        <label className="label">Сумма накопления</label>
        <AutoTextarea value={goal.amount} onChange={v => onChange("amount", v)} placeholder="100 000 ₽" minRows={1} className="field-input field-input-single" />
      </div>
      <div className="field-row">
        <label className="label">Срок</label>
        <AutoTextarea value={goal.deadline} onChange={v => onChange("deadline", v)} placeholder="3 месяца / к июню 2025" minRows={1} className="field-input field-input-single" />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SemeynyyDogovorPage() {
  const { state, setState, update, reset } = useChecklistState<State>(
    "checklist:semeynyy-dogovor:v1",
    INITIAL,
  );
  const [navOpen, setNavOpen] = useState(false);

  // Обновление полей партнёров
  const setP1 = (key: string, v: string) => {
    update(("p1" + key) as keyof State, v as never);
  };
  const setP2 = (key: string, v: string) => {
    update(("p2" + key) as keyof State, v as never);
  };

  const toggleWeek = (i: number) =>
    setState(p => { const weekDone = [...p.weekDone]; weekDone[i] = !weekDone[i]; return { ...p, weekDone }; });
  const resetWeek = () =>
    setState(p => ({ ...p, weekDone: [false, false, false, false] }));

  const addGoal = () =>
    setState(p => ({ ...p, goals: [...p.goals, { name: "", amount: "", deadline: "" }] }));
  const removeGoal = (i: number) =>
    setState(p => ({ ...p, goals: p.goals.filter((_, idx) => idx !== i) }));
  const updateGoal = (i: number, key: keyof Goal, v: string) =>
    setState(p => ({ ...p, goals: p.goals.map((g, idx) => idx === i ? { ...g, [key]: v } : g) }));

  // Вычисляемые итоги
  const income = num(state.p1income1) + num(state.p1income2) + num(state.p2income1) + num(state.p2income2);
  const expenses = num(state.p1expense) + num(state.p1personal) + num(state.p2expense) + num(state.p2personal);
  const balance = income - expenses;

  const weekDoneCount = state.weekDone.filter(Boolean).length;
  const weekPct = Math.round((weekDoneCount / 4) * 100);

  // Прогресс
  const progress = useMemo(() => {
    const finFilled = [state.p1income1, state.p1expense, state.p2income1, state.p2expense].filter(v => v.trim()).length;
    const feelFilled = [state.p1feeling, state.p2feeling].filter(v => v.trim()).length;
    const agreeFilled = [state.agreeRent, state.agreeFood, state.whenTalk].filter(v => v.trim()).length;
    const goalFilled = state.goals.filter(g => g.name.trim()).length > 0 ? 1 : 0;
    const planFilled = [state.sharedDream].filter(v => v.trim()).length;
    const weekFilled = state.weekDone.some(Boolean) ? 1 : 0;
    const total = 4 + 2 + 3 + 1 + 1 + 1;
    return Math.round(((finFilled + feelFilled + agreeFilled + goalFilled + planFilled + weekFilled) / total) * 100);
  }, [state]);

  const finDone = [state.p1income1, state.p1income2, state.p1expense, state.p1personal,
    state.p2income1, state.p2income2, state.p2expense, state.p2personal].filter(v => v.trim()).length;
  const feelDone = [state.p1feeling, state.p1surprised, state.p1fear, state.p2feeling, state.p2surprised, state.p2fear].filter(v => v.trim()).length;
  const agreeDone = [state.agreeRent, state.agreeFood, state.agreeKids, state.agreeUtils, state.agreeOther, state.freeAmount, state.whenTalk, state.talkRule].filter(v => v.trim()).length;
  const planDone = [
    ...state.goals.filter(g => g.name.trim()),
    ...[state.debtName, state.cutsTogether, state.sharedDream].filter(v => v.trim()),
  ].length;

  const weekTasks = [
    "Найти одну статью расходов, которую сокращаем вместе",
    "Сэкономленные деньги положить в общую копилку",
    "В конце недели сказать друг другу: «Мы сделали это вместе»",
    "Распечатать план и повесить на видное место",
  ];

  return (
    <>
      <NavBar progress={progress} open={navOpen} setOpen={setNavOpen} />
      <main className="paper-page">
        <CoverPage />

        <div className="guide-card no-print">
          <div>
            <div className="guide-kicker sans">Как проходить</div>
            <h2>Заполняйте вдвоём. Сайт сохраняет ответы автоматически.</h2>
          </div>
          <p>
            В процессе не обвиняйте друг друга. Страх живёт в темноте - когда вы вытащили его на свет, он уменьшается.
          </p>
          <a href="#p2" className="guide-button sans">Начать с аудита финансов</a>
        </div>

        {/* ══ РАЗДЕЛ 1: Финансы ══════════════════════════════════════════════ */}
        <section id="p2" className="section">
          <SectionHeader title="Аудит денег" done={finDone} total={8} label="полей" hideBar />
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Это заполняйте вместе. Воздержитесь от любых высказываний в процессе.
          </p>

          <div className="partner-comparison">
            <PartnerFinanceCard
              label="Партнёр 1"
              avatarLetter="Я"
              income1={state.p1income1}
              income2={state.p1income2}
              expense={state.p1expense}
              personal={state.p1personal}
              onChange={setP1}
            />
            <div className="partner-divider" />
            <PartnerFinanceCard
              label="Партнёр 2"
              avatarLetter="П"
              income1={state.p2income1}
              income2={state.p2income2}
              expense={state.p2expense}
              personal={state.p2personal}
              onChange={setP2}
            />
          </div>

          <TotalsBlock income={income} expenses={expenses} balance={balance} />

          <PageFooter index={1} total={TOTAL_SECTIONS} />
        </section>

        {/* ══ РАЗДЕЛ 2: Чувства ══════════════════════════════════════════════ */}
        <section id="p3" className="section">
          <SectionHeader title="Реакция на цифры" done={feelDone} total={6} label="ответов" hideBar />
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Прочитайте молча то, что написал каждый. Не комментируйте сразу.
          </p>

          <div className="partner-comparison">
            <PartnerFeelCard
              label="Партнёр 1"
              avatarLetter="Я"
              feeling={state.p1feeling}
              surprised={state.p1surprised}
              fear={state.p1fear}
              onChange={(key, v) => update(`p1${key}` as keyof State, v as never)}
            />
            <div className="partner-divider" />
            <PartnerFeelCard
              label="Партнёр 2"
              avatarLetter="П"
              feeling={state.p2feeling}
              surprised={state.p2surprised}
              fear={state.p2fear}
              onChange={(key, v) => update(`p2${key}` as keyof State, v as never)}
            />
          </div>

          <div className="quote-card mt-10" style={{ background: "var(--c-purple-soft)" }}>
            Страх живёт в темноте - когда вы вытащили его на свет, он уменьшается.
          </div>

          <PageFooter index={2} total={TOTAL_SECTIONS} />
        </section>

        {/* ══ РАЗДЕЛ 3: Договорённости ═══════════════════════════════════════ */}
        <section id="p4" className="section">
          <SectionHeader title="Взрослые договорённости" done={agreeDone} total={8} label="пунктов" hideBar />
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Кто за что отвечает и как разговариваем о деньгах.
          </p>

          <div className="flex items-start gap-3 mt-8 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Кто за что платит</div>
          </div>

          <div style={{ borderTop: "1px solid var(--c-purple-line)", marginTop: "4px" }}>
            <AgreeRow question="Аренда / ипотека" value={state.agreeRent} onChange={v => update("agreeRent", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам / сумма" />
            <AgreeRow question="Продукты и еда" value={state.agreeFood} onChange={v => update("agreeFood", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
            <AgreeRow question="Дети (школа, кружки, одежда)" value={state.agreeKids} onChange={v => update("agreeKids", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
            <AgreeRow question="Коммунальные платежи" value={state.agreeUtils} onChange={v => update("agreeUtils", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
            <AgreeRow question="Другое (впишите своё)" value={state.agreeOther} onChange={v => update("agreeOther", v)} placeholder="Статья расходов - кто платит" />
          </div>

          <div className="flex items-start gap-3 mt-10 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Правила общения о деньгах</div>
          </div>

          <div style={{ borderTop: "1px solid var(--c-purple-line)", marginTop: "4px" }}>
            <AgreeRow question="Сумма без отчёта - каждый тратит сам, без обсуждения">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="number"
                  value={state.freeAmount}
                  onChange={e => update("freeAmount", e.target.value)}
                  placeholder="15 000"
                  style={{
                    width: "140px", padding: "7px 10px", border: "1px solid var(--c-purple-line)",
                    borderRadius: "10px", background: "var(--c-paper)", fontFamily: "var(--font-cormorant), serif",
                    fontSize: "18px", color: "var(--c-purple-deep)", outline: "none", textAlign: "right",
                    MozAppearance: "textfield",
                  } as React.CSSProperties}
                />
                <span style={{ fontSize: "16px", color: "var(--c-muted)" }}>₽</span>
              </div>
            </AgreeRow>
            <AgreeRow question="Когда и как часто говорим о деньгах" value={state.whenTalk} onChange={v => update("whenTalk", v)} placeholder="Каждое воскресенье за завтраком, 15 минут" />
            <AgreeRow question="Наше правило при разговоре о деньгах" value={state.talkRule} onChange={v => update("talkRule", v)} placeholder="Не обвинять, говорить о чувствах, не перебивать..." />
          </div>

          <PageFooter index={3} total={TOTAL_SECTIONS} />
        </section>

        {/* ══ РАЗДЕЛ 4: 90 дней ══════════════════════════════════════════════ */}
        <section id="p5" className="section">
          <SectionHeader title="Общий план на 90 дней" done={planDone} total={4} label="пунктов" hideBar />
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Цели, которые объединяют, а не разделяют.
          </p>

          <div className="flex items-start gap-3 mt-8 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Общие цели</div>
          </div>

          {state.goals.map((goal, i) => (
            <GoalCard
              key={i}
              n={i + 1}
              goal={goal}
              onChange={(key, v) => updateGoal(i, key, v)}
              onRemove={() => removeGoal(i)}
              canRemove={state.goals.length > 1}
            />
          ))}
          <button
            type="button"
            onClick={addGoal}
            style={{
              width: "100%", padding: "13px",
              border: "2px dashed var(--c-purple-line)", borderRadius: "16px",
              background: "none", color: "var(--c-muted)",
              fontFamily: "var(--font-cormorant), serif", fontSize: "18px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "border-color 0.15s, color 0.15s",
              marginBottom: "28px",
            }}
          >
            добавить цель
          </button>

          <div className="flex items-start gap-3 mt-8 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Долг, который закрываем первым</div>
          </div>
          <div className="debt-fields-grid">
            <div className="field-row">
              <label className="label">Кому / название</label>
              <AutoTextarea value={state.debtName} onChange={v => update("debtName", v)} placeholder="Кредит в Сбербанке..." minRows={1} className="field-input field-input-single" />
            </div>
            <div className="field-row">
              <label className="label">Сумма</label>
              <AutoTextarea value={state.debtAmount} onChange={v => update("debtAmount", v)} placeholder="50 000 ₽" minRows={1} className="field-input field-input-single" />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-8 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>От чего отказываемся вместе</div>
          </div>
          <div className="field-row">
            <AutoTextarea value={state.cutsTogether} onChange={v => update("cutsTogether", v)} placeholder="Не заказываем доставку - готовим вместе / отключаем подписки / не ходим в рестораны в этом месяце..." />
          </div>

          <div className="flex items-start gap-3 mt-8 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Наша общая мечта</div>
          </div>
          <div className="field-row">
            <AutoTextarea value={state.sharedDream} onChange={v => update("sharedDream", v)} placeholder="Отпуск, ремонт, своё жильё, образование детей..." minRows={1} className="field-input field-input-single" />
          </div>

          <PageFooter index={4} total={TOTAL_SECTIONS} />
        </section>

        {/* ══ РАЗДЕЛ 5: Задание на неделю ════════════════════════════════════ */}
        <section id="p6" className="section">
          <SectionHeader title="Задание на эту неделю" done={weekDoneCount} total={4} label="выполнено" hideBar />
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Маленькая победа, которую делаете вместе.
          </p>

          <div style={{ marginTop: "20px" }}>
            {weekTasks.map((task, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleWeek(i)}
                className="check-option"
                style={{ marginBottom: "4px" }}
              >
                <span className="checkbox-square" data-checked={state.weekDone[i]}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="check-option-text">{task}</span>
              </button>
            ))}
          </div>

          <div className="progress-row" style={{ marginTop: "20px" }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${weekPct}%` }} />
            </div>
            <div className="progress-label sans">{weekDoneCount} из 4 выполнено</div>
          </div>

          <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={resetWeek}
              style={{ fontSize: "14px", color: "var(--c-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}
            >
              сбросить
            </button>
          </div>

          {/* Подписи */}
          <div className="flex items-start gap-3 mt-10 mb-3">
            <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
            <div className="h2" style={{ paddingTop: "3px" }}>Договор подписан</div>
          </div>
          <div className="signature-grid">
            <SignatureCard
              partner="Партнёр 1"
              name={state.p1SignatureName}
              date={state.p1SignatureDate}
              onNameChange={(value) => update("p1SignatureName", value)}
              onDateChange={(value) => update("p1SignatureDate", value)}
            />
            <SignatureCard
              partner="Партнёр 2"
              name={state.p2SignatureName}
              date={state.p2SignatureDate}
              onNameChange={(value) => update("p2SignatureName", value)}
              onDateChange={(value) => update("p2SignatureDate", value)}
            />
          </div>

          <div className="quote-card mt-10" style={{ background: "var(--c-purple-soft)" }}>
            <div className="flex items-start gap-3">
              <div className="arrow-bullet" aria-hidden><img src={`${PUBLIC_BASE_PATH}/arow.svg`} alt="" /></div>
              <div>
                Этот чек-лист - один из инструментов выстраивания денежных договорённостей в паре.
                Чтобы глубже разобраться в своих жизненных сценариях и способах реагирования,
                читайте книгу Натальи Батаевой «На Личность идёт НаЛичность» или проходите
                онлайн-курс.
              </div>
            </div>
          </div>

          <div className="cta-buttons no-print">
            <a
              href="https://na-lichnost.ru/book"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn cta-btn--book"
            >
              Книга «На Личность идёт НаЛичность»
            </a>
            <a
              href="https://na-lichnost.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn cta-btn--course"
            >
              Онлайн-курс
            </a>
          </div>

          <div className="final-actions no-print">
            <PrintButton />
            <ResetButton onReset={reset} />
          </div>

          <PageFooter index={5} total={TOTAL_SECTIONS} />
        </section>
      </main>
    </>
  );
}
