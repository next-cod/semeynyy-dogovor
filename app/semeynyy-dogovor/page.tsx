"use client";
import * as React from "react";

// ── Auto-resize textarea ──────────────────────────────────────────────────────
function AutoTA({
  value,
  onChange,
  placeholder,
  className = "simple-textarea",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);
  React.useEffect(() => { resize(); }, [value, resize]);
  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
    />
  );
}

// ── Number input ──────────────────────────────────────────────────────────────
function NumInput({
  value,
  onChange,
  placeholder = "0",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      className="num-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ── Simple text input ─────────────────────────────────────────────────────────
function TextInput({
  value,
  onChange,
  placeholder,
  className = "simple-input",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      className={className}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ── Agree row with text input ─────────────────────────────────────────────────
function AgreeRow({
  icon,
  question,
  value,
  onChange,
  placeholder,
  children,
}: {
  icon: string;
  question: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="agree-item">
      <div className="agree-icon" aria-hidden="true">{icon}</div>
      <div className="agree-content">
        <div className="agree-q">{question}</div>
        {children ?? (
          <input
            type="text"
            className="agree-input"
            value={value ?? ""}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Goal = { id: number; name: string; amount: string; deadline: string };

type State = {
  // Step 1 - finances
  p1income1: string; p1income2: string; p1expense: string; p1personal: string;
  p2income1: string; p2income2: string; p2expense: string; p2personal: string;
  // Step 1 - emotions
  p1feeling: string; p1surprised: string; p1fear: string;
  p2feeling: string; p2surprised: string; p2fear: string;
  // Step 2 - who pays
  agreeRent: string; agreeFood: string; agreeKids: string;
  agreeUtils: string; agreeOther: string;
  // Step 2 - rules
  freeAmount: string; whenTalk: string; talkRule: string;
  // Step 3 - goals
  goals: Goal[];
  // Step 3 - debt
  debtName: string; debtAmount: string;
  // Step 3 - cuts + dream
  cutsTogether: string; sharedDream: string;
  // Week tasks
  weekDone: boolean[];
};

const DEFAULT_STATE: State = {
  p1income1: "", p1income2: "", p1expense: "", p1personal: "",
  p2income1: "", p2income2: "", p2expense: "", p2personal: "",
  p1feeling: "", p1surprised: "", p1fear: "",
  p2feeling: "", p2surprised: "", p2fear: "",
  agreeRent: "", agreeFood: "", agreeKids: "",
  agreeUtils: "", agreeOther: "",
  freeAmount: "", whenTalk: "", talkRule: "",
  goals: [{ id: 1, name: "", amount: "", deadline: "" }],
  debtName: "", debtAmount: "",
  cutsTogether: "", sharedDream: "",
  weekDone: [false, false, false, false],
};

const STORAGE_KEY = "semeynyy-dogovor-v1";

function loadState(): State {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(s: State) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function num(v: string) { return parseFloat(v) || 0; }
function fmtRub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Page() {
  const [s, setS] = React.useState<State>(DEFAULT_STATE);
  const [mounted, setMounted] = React.useState(false);
  const [goalCounter, setGoalCounter] = React.useState(2);

  React.useEffect(() => {
    const loaded = loadState();
    setS(loaded);
    setMounted(true);
    // restore goal counter
    if (loaded.goals.length > 0) {
      setGoalCounter(Math.max(...loaded.goals.map(g => g.id)) + 1);
    }
  }, []);

  React.useEffect(() => {
    if (mounted) saveState(s);
  }, [s, mounted]);

  // helpers
  const set = <K extends keyof State>(key: K, val: State[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const setGoal = (id: number, key: keyof Goal, val: string) =>
    setS(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, [key]: val } : g),
    }));

  const addGoal = () => {
    const id = goalCounter;
    setGoalCounter(c => c + 1);
    setS(prev => ({
      ...prev,
      goals: [...prev.goals, { id, name: "", amount: "", deadline: "" }],
    }));
  };

  const removeGoal = (id: number) =>
    setS(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));

  const toggleWeek = (idx: number) =>
    setS(prev => {
      const wd = [...prev.weekDone];
      wd[idx] = !wd[idx];
      return { ...prev, weekDone: wd };
    });

  const resetWeek = () =>
    setS(prev => ({ ...prev, weekDone: [false, false, false, false] }));

  const resetAll = () => {
    if (typeof window !== "undefined" && confirm("Очистить все данные?")) {
      setS(DEFAULT_STATE);
    }
  };

  // computed totals
  const income = num(s.p1income1) + num(s.p1income2) + num(s.p2income1) + num(s.p2income2);
  const expenses = num(s.p1expense) + num(s.p1personal) + num(s.p2expense) + num(s.p2personal);
  const balance = income - expenses;

  const weekDoneCount = s.weekDone.filter(Boolean).length;
  const weekPct = Math.round((weekDoneCount / 4) * 100);

  const weekTasks = [
    "Найти одну статью расходов, которую сокращаем вместе",
    "Сэкономленные деньги положить в общую копилку",
    "В конце недели сказать друг другу: «Мы сделали это вместе»",
    "Распечатать план и повесить на видное место",
  ];

  if (!mounted) return null;

  return (
    <div>
      {/* ── COVER ── */}
      <div className="family-cover">
        <div className="cover-badge">На личность идёт наличность</div>
        <h1>
          Семейный<br />
          <span>финансовый договор</span>
        </h1>
        <p>Метод Натальи Батаевой · Заполняйте вместе</p>
        <div className="cover-steps">
          <div className="cover-step">
            <div className="cover-step-num cs-purple">1</div>
            Аудит денег и чувств
          </div>
          <div className="cover-step">
            <div className="cover-step-num cs-teal">2</div>
            Взрослые договорённости
          </div>
          <div className="cover-step">
            <div className="cover-step-num cs-amber">3</div>
            План на 90 дней
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="paper-page">

        {/* ════ STEP 1 ════ */}
        <div className="step-block">
          <div className="step-block-head">
            <div className="step-num-circle sn-purple">1</div>
            <div>
              <div className="step-block-title">Аудит денег и чувств</div>
              <div className="step-block-desc">
                Эти таблицы заполняйте вместе. В процессе не обвиняйте друг друга, воздержитесь от любых высказываний.
              </div>
            </div>
          </div>

          {/* Finance table */}
          <div className="white-card">
            <div className="partner-grid">
              {/* Partner 1 */}
              <div className="partner-col">
                <div className="partner-label">
                  <div className="avatar av-purple">Я</div>
                  Партнёр 1
                </div>
                <div className="income-row">
                  <span className="income-label">Основной доход</span>
                  <NumInput value={s.p1income1} onChange={v => set("p1income1", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Доп. доход</span>
                  <NumInput value={s.p1income2} onChange={v => set("p1income2", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Обязат. расходы</span>
                  <NumInput value={s.p1expense} onChange={v => set("p1expense", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Личные расходы</span>
                  <NumInput value={s.p1personal} onChange={v => set("p1personal", v)} />
                  <span className="rub-sign">₽</span>
                </div>
              </div>
              {/* Partner 2 */}
              <div className="partner-col">
                <div className="partner-label">
                  <div className="avatar av-teal">П</div>
                  Партнёр 2
                </div>
                <div className="income-row">
                  <span className="income-label">Основной доход</span>
                  <NumInput value={s.p2income1} onChange={v => set("p2income1", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Доп. доход</span>
                  <NumInput value={s.p2income2} onChange={v => set("p2income2", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Обязат. расходы</span>
                  <NumInput value={s.p2expense} onChange={v => set("p2expense", v)} />
                  <span className="rub-sign">₽</span>
                </div>
                <div className="income-row">
                  <span className="income-label">Личные расходы</span>
                  <NumInput value={s.p2personal} onChange={v => set("p2personal", v)} />
                  <span className="rub-sign">₽</span>
                </div>
              </div>
            </div>
            {/* Totals */}
            <div className="totals-section">
              <div className="total-row">
                <span className="total-label">Семейный доход</span>
                <span className="total-val">{fmtRub(income)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Общие расходы</span>
                <span className="total-val">{fmtRub(expenses)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Остаток</span>
                <span className={`total-val ${balance >= 0 ? "pos" : "neg"}`}>
                  {balance >= 0 ? "+" : ""}{fmtRub(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Emotional reactions */}
          <div className="white-card">
            <div className="partner-grid">
              {/* Partner 1 emotions */}
              <div className="partner-col">
                <div className="partner-label">
                  <div className="avatar av-purple">Я</div>
                  Реакция партнёра 1
                </div>
                <div className="field-block" style={{ marginBottom: "14px" }}>
                  <div className="field-label">Что я почувствовал(а)</div>
                  <AutoTA
                    value={s.p1feeling}
                    onChange={v => set("p1feeling", v)}
                    placeholder="Страх, удивление, обида, облегчение..."
                  />
                </div>
                <div className="field-block" style={{ marginBottom: "14px" }}>
                  <div className="field-label">Что меня удивило</div>
                  <AutoTA
                    value={s.p1surprised}
                    onChange={v => set("p1surprised", v)}
                    placeholder="Не знал(а) об этом..."
                  />
                </div>
                <div className="field-block">
                  <div className="field-label">Страх или стыд, о котором хочу сказать</div>
                  <TextInput
                    value={s.p1fear}
                    onChange={v => set("p1fear", v)}
                    placeholder="Я боюсь, что... / Мне стыдно, что..."
                  />
                </div>
              </div>
              {/* Partner 2 emotions */}
              <div className="partner-col">
                <div className="partner-label">
                  <div className="avatar av-teal">П</div>
                  Реакция партнёра 2
                </div>
                <div className="field-block" style={{ marginBottom: "14px" }}>
                  <div className="field-label">Что я почувствовал(а)</div>
                  <AutoTA
                    value={s.p2feeling}
                    onChange={v => set("p2feeling", v)}
                    placeholder="Страх, удивление, обида, облегчение..."
                  />
                </div>
                <div className="field-block" style={{ marginBottom: "14px" }}>
                  <div className="field-label">Что меня удивило</div>
                  <AutoTA
                    value={s.p2surprised}
                    onChange={v => set("p2surprised", v)}
                    placeholder="Не знал(а) об этом..."
                  />
                </div>
                <div className="field-block">
                  <div className="field-label">Страх или стыд, о котором хочу сказать</div>
                  <TextInput
                    value={s.p2fear}
                    onChange={v => set("p2fear", v)}
                    placeholder="Я боюсь, что... / Мне стыдно, что..."
                  />
                </div>
              </div>
            </div>
            <div className="card-section">
              <div className="note-italic">
                Прочитайте молча листы друг друга. Не комментируйте. Страх живёт в темноте - когда вы вытащили его на свет, он уменьшается.
              </div>
            </div>
          </div>
        </div>

        {/* ════ STEP 2 ════ */}
        <div className="step-block">
          <div className="step-block-head">
            <div className="step-num-circle sn-teal">2</div>
            <div>
              <div className="step-block-title">Взрослые договорённости</div>
              <div className="step-block-desc">Кто за что отвечает и как разговариваем о деньгах</div>
            </div>
          </div>

          <div className="white-card">
            {/* Who pays */}
            <div className="card-section">
              <div className="section-label">Кто за что платит</div>
              <AgreeRow icon="🏠" question="Аренда / ипотека" value={s.agreeRent} onChange={v => set("agreeRent", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам / сумма" />
              <AgreeRow icon="🛒" question="Продукты и еда" value={s.agreeFood} onChange={v => set("agreeFood", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
              <AgreeRow icon="💛" question="Дети (школа, кружки, одежда)" value={s.agreeKids} onChange={v => set("agreeKids", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
              <AgreeRow icon="⚡" question="Коммунальные платежи" value={s.agreeUtils} onChange={v => set("agreeUtils", v)} placeholder="Партнёр 1 / Партнёр 2 / пополам" />
              <AgreeRow icon="✏️" question="Другое (впишите своё)" value={s.agreeOther} onChange={v => set("agreeOther", v)} placeholder="Статья расходов - кто платит" />
            </div>

            {/* Rules */}
            <div className="card-section">
              <div className="section-label">Правила общения о деньгах</div>
              <AgreeRow icon="💰" question="Сумма без отчёта - каждый тратит сам, без обсуждения">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  <input
                    type="number"
                    className="agree-input"
                    style={{ maxWidth: "160px", textAlign: "right" }}
                    value={s.freeAmount}
                    placeholder="15 000"
                    onChange={e => set("freeAmount", e.target.value)}
                  />
                  <span style={{ fontSize: "17px", color: "var(--c-muted)" }}>₽</span>
                </div>
              </AgreeRow>
              <AgreeRow icon="📅" question="Когда и как часто говорим о деньгах" value={s.whenTalk} onChange={v => set("whenTalk", v)} placeholder="Каждое воскресенье за завтраком, 15 минут" />
              <AgreeRow icon="💬" question="Наше правило при разговоре о деньгах" value={s.talkRule} onChange={v => set("talkRule", v)} placeholder="Не обвинять, говорить о чувствах, не перебивать..." />
            </div>
          </div>
        </div>

        {/* ════ STEP 3 ════ */}
        <div className="step-block">
          <div className="step-block-head">
            <div className="step-num-circle sn-amber">3</div>
            <div>
              <div className="step-block-title">Общий план на 90 дней</div>
              <div className="step-block-desc">Цели, которые объединяют, а не разделяют</div>
            </div>
          </div>

          <div className="white-card">
            {/* Goals */}
            <div className="card-section">
              <div className="section-label">Общие цели</div>
              {s.goals.map((goal, idx) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-head">
                    <span className="goal-num">Цель {idx + 1}</span>
                    {s.goals.length > 1 && (
                      <button className="goal-del" onClick={() => removeGoal(goal.id)} aria-label="Удалить цель">✕</button>
                    )}
                  </div>
                  <div className="goal-row">
                    <span className="goal-label">Название цели</span>
                    <input
                      type="text"
                      className="goal-input"
                      value={goal.name}
                      placeholder="Поездка в отпуск, ремонт, образование..."
                      onChange={e => setGoal(goal.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="goal-row">
                    <span className="goal-label">Сумма накопления</span>
                    <input
                      type="text"
                      className="goal-input"
                      value={goal.amount}
                      placeholder="100 000 ₽"
                      onChange={e => setGoal(goal.id, "amount", e.target.value)}
                    />
                  </div>
                  <div className="goal-row">
                    <span className="goal-label">Срок</span>
                    <input
                      type="text"
                      className="goal-input"
                      value={goal.deadline}
                      placeholder="3 месяца / к июню 2025"
                      onChange={e => setGoal(goal.id, "deadline", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button className="add-goal-btn" onClick={addGoal}>
                <span>＋</span>
                <span>добавить цель</span>
              </button>
            </div>

            {/* First debt to close */}
            <div className="card-section">
              <div className="section-label">Долг, который закрываем первым</div>
              <div className="two-col-fields">
                <div className="field-block">
                  <div className="field-label">Кому / название</div>
                  <TextInput value={s.debtName} onChange={v => set("debtName", v)} placeholder="Кредит в Сбербанке..." />
                </div>
                <div className="field-block">
                  <div className="field-label">Сумма</div>
                  <TextInput value={s.debtAmount} onChange={v => set("debtAmount", v)} placeholder="50 000 ₽" />
                </div>
              </div>
            </div>

            {/* Cuts together */}
            <div className="card-section">
              <div className="section-label">От чего отказываемся вместе</div>
              <AutoTA
                value={s.cutsTogether}
                onChange={v => set("cutsTogether", v)}
                placeholder="Не заказываем доставку - готовим вместе / отключаем подписки / не ходим в рестораны в этом месяце..."
              />
            </div>

            {/* Shared dream */}
            <div className="card-section">
              <div className="section-label">Наша общая мечта (что нас объединяет)</div>
              <TextInput
                value={s.sharedDream}
                onChange={v => set("sharedDream", v)}
                placeholder="Отпуск, ремонт, своё жильё, образование детей..."
              />
            </div>
          </div>
        </div>

        {/* ════ WEEK TASK ════ */}
        <div className="step-block">
          <div className="step-block-head">
            <div className="step-num-circle sn-star">★</div>
            <div>
              <div className="step-block-title">Задание на эту неделю</div>
              <div className="step-block-desc">Маленькая победа, которую делаете вместе</div>
            </div>
          </div>

          <div className="white-card">
            <div className="card-section">
              {weekTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="week-item"
                  onClick={() => toggleWeek(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === " " && toggleWeek(idx)}
                >
                  <div className={`week-cb${s.weekDone[idx] ? " done" : ""}`} />
                  <span className={`week-text${s.weekDone[idx] ? " done" : ""}`}>{task}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="week-progress">
            <div className="week-prog-track">
              <div className="week-prog-fill" style={{ width: `${weekPct}%` }} />
            </div>
            <span className="week-prog-label">{weekDoneCount} из 4 выполнено</span>
            <button className="week-reset-btn" onClick={resetWeek}>сбросить</button>
          </div>
        </div>

        {/* ════ SIGNATURES ════ */}
        <div className="white-card">
          <div className="card-section">
            <div className="section-label">Договор подписан</div>
            <div className="sign-grid">
              <div className="sign-field">
                <div className="sign-label">Партнёр 1</div>
                <div className="sign-line" />
                <div className="sign-date">дата: _______________</div>
              </div>
              <div className="sign-field">
                <div className="sign-label">Партнёр 2</div>
                <div className="sign-line" />
                <div className="sign-date">дата: _______________</div>
              </div>
            </div>
          </div>
          <div className="card-section" style={{ borderBottom: "none" }}>
            <div className="final-quote">
              <div className="final-quote-text">
                «Дисциплина в деньгах - это свобода в отношениях. Один день дисциплины не решает ничего, но 90 дней дисциплины меняют качество ваших отношений»
              </div>
              <div className="final-quote-author">- Наталья Батаева @MethodBataeva</div>
            </div>
          </div>
        </div>

        {/* ════ ACTIONS ════ */}
        <div className="final-actions no-print">
          <button type="button" onClick={() => window.print()} className="action-button action-button-primary">
            Печать / PDF
          </button>
          <button type="button" onClick={resetAll} className="action-button action-button-ghost">
            Очистить ответы
          </button>
        </div>

        {/* Footer */}
        <div className="footer-page sans" style={{ marginTop: "48px" }}>
          <a
            href="https://www.instagram.com/MethodBataeva"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontStyle: "italic", color: "inherit", textDecoration: "none" }}
          >
            @MethodBataeva
          </a>
          <span>Семейный финансовый договор</span>
        </div>
      </div>
    </div>
  );
}
