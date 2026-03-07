import { AppLocale } from '../i18n';
import type { CustomMessageRule, MotivationStyle } from '../store/settings.store';
import type { HabitCategory } from '../store/habits.store';

type ToneLevel = 0 | 1 | 2 | 3;
type MessageBuilder = (copy: CategoryCopy) => string;

type CategoryCopy = {
  focus: string;
  action: string;
  loss: string;
  win: string;
  identity: string;
};

type PhraseSet = {
  lead: MessageBuilder[];
  thrust: MessageBuilder[];
  finish: MessageBuilder[];
  cap: number;
};

type StyleTemplateSet = Record<MotivationStyle, Record<ToneLevel, PhraseSet>>;
type CategoryMessageSet = Record<HabitCategory, string[]>;
type StyleMessageSet = Record<ToneLevel, CategoryMessageSet>;
type LocaleMessageSet = Record<MotivationStyle, StyleMessageSet>;

const CATEGORIES: HabitCategory[] = [
  'study',
  'exercise',
  'health',
  'work',
  'personal',
  'discipline',
];

const ES_COPY: Record<HabitCategory, CategoryCopy> = {
  study: {
    focus: 'estudio',
    action: 'sientate y estudia ahora',
    loss: 'te quedas atras mientras otros avanzan',
    win: 'tu nivel sube y se nota',
    identity: 'tu version preparada',
  },
  exercise: {
    focus: 'entrenamiento',
    action: 'entrena hoy sin negociar',
    loss: 'tu cuerpo paga cada aplazo',
    win: 'tu cuerpo responde mas fuerte',
    identity: 'tu version fuerte',
  },
  health: {
    focus: 'salud',
    action: 'cumple tu habito de salud hoy',
    loss: 'tu energia se cae por tus propias decisiones',
    win: 'tu energia y enfoque mejoran',
    identity: 'tu version cuidada',
  },
  work: {
    focus: 'trabajo',
    action: 'resuelve esa tarea de trabajo ya',
    loss: 'te vuelves cuello de botella',
    win: 'tu rendimiento queda por encima',
    identity: 'tu version profesional',
  },
  personal: {
    focus: 'objetivo personal',
    action: 'cumple tu objetivo personal hoy',
    loss: 'tu palabra pierde valor cada dia',
    win: 'ganas respeto por ti',
    identity: 'tu version confiable',
  },
  discipline: {
    focus: 'disciplina',
    action: 'cumple la rutina como dijiste',
    loss: 'manda tu version floja',
    win: 'tu identidad disciplinada se fortalece',
    identity: 'tu version disciplinada',
  },
};

const EN_COPY: Record<HabitCategory, CategoryCopy> = {
  study: {
    focus: 'study',
    action: 'sit down and study now',
    loss: 'you fall behind while others move forward',
    win: 'your level clearly rises',
    identity: 'your prepared version',
  },
  exercise: {
    focus: 'training',
    action: 'train today without negotiating',
    loss: 'your body pays for every delay',
    win: 'your body responds stronger',
    identity: 'your stronger version',
  },
  health: {
    focus: 'health',
    action: 'complete your health habit today',
    loss: 'your energy drops because of your choices',
    win: 'your energy and focus improve',
    identity: 'your healthier version',
  },
  work: {
    focus: 'work',
    action: 'finish that work task now',
    loss: 'you become the bottleneck',
    win: 'your performance stands above average',
    identity: 'your professional version',
  },
  personal: {
    focus: 'personal goal',
    action: 'complete your personal goal today',
    loss: 'your word loses value every day',
    win: 'you gain self-respect',
    identity: 'your reliable version',
  },
  discipline: {
    focus: 'discipline',
    action: 'execute your routine as promised',
    loss: 'your lazy version stays in charge',
    win: 'your disciplined identity gets stronger',
    identity: 'your disciplined version',
  },
};

const ES_TEMPLATES: StyleTemplateSet = {
  positive: {
    0: {
      lead: [
        (c) => `Hoy toca ${c.focus}.`,
        (c) => `Tu dia mejora cuando cumples ${c.focus}.`,
        (c) => `Un paso real en ${c.focus} vale mas que mil ideas.`,
        (c) => `El progreso empieza contigo hoy.`,
        (c) => `${c.identity} aparece cuando actuas.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Hazlo y ${c.win}.`,
        (c) => `Cumple esto y cambias el ritmo del dia.`,
        (c) => `Pequeno acto, gran impacto: ${c.action}.`,
        (c) => `Tu consistencia se construye hoy.`,
      ],
      finish: [
        () => `Sin prisa, sin pausa.`,
        () => `Tu yo futuro te lo agradece.`,
        () => `Esta si cuenta.`,
        () => `Vamos con una victoria limpia.`,
      ],
      cap: 70,
    },
    1: {
      lead: [
        (c) => `Dices que te importa ${c.focus}.`,
        (c) => `Si de verdad quieres cambio, toca moverte.`,
        (c) => `No es cuestion de ganas, es cuestion de palabra.`,
        (c) => `Tu discurso se valida con ejecucion.`,
        (c) => `Hoy se nota si vas en serio.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Hazlo y ${c.win}.`,
        (c) => `Tu nivel sube cuando cumples.`,
        (c) => `Accion corta ahora, confianza grande despues.`,
        (c) => `Tu identidad mejora cuando actuas.`,
      ],
      finish: [
        () => `Deja el ruido y ejecuta.`,
        () => `Esto te define.`,
        () => `Sin drama.`,
        () => `Hazlo bien y sigue.`,
      ],
      cap: 70,
    },
    2: {
      lead: [
        (c) => `Tu estandar en ${c.focus} se decide hoy.`,
        (c) => `Cada excusa que cortas te vuelve mas fuerte.`,
        (c) => `No esperes motivacion: fabrica resultados.`,
        (c) => `Esta es la parte que separa amateurs de serios.`,
        (c) => `Tu ritmo de crecimiento depende de esto.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Hazlo y ${c.win}.`,
        (c) => `Ejecuta hoy para no retroceder manana.`,
        (c) => `Tu disciplina se entrena en minutos como este.`,
        (c) => `Actuar ahora te pone delante.`,
      ],
      finish: [
        () => `Sin negociar.`,
        () => `Nivel alto, accion alta.`,
        () => `No te frenes.`,
        () => `Cumple y avanza.`,
      ],
      cap: 72,
    },
    3: {
      lead: [
        (c) => `Quieres resultados grandes?`,
        (c) => `Se acabaron las excusas suaves.`,
        (c) => `Tu techo lo rompes ahora o no lo rompes.`,
        (c) => `Tu version elite no pide permiso.`,
        (c) => `Este minuto decide tu narrativa.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Hazlo y ${c.win}.`,
        (c) => `Ejecucion brutal en ${c.focus}.`,
        (c) => `Hoy te conviertes en alguien mas serio.`,
        (c) => `Tu identidad se forja en accion inmediata.`,
      ],
      finish: [
        () => `Ahora.`,
        () => `Sin pausa.`,
        () => `Sin permiso.`,
        () => `Sin mirar atras.`,
      ],
      cap: 72,
    },
  },
  negative: {
    0: {
      lead: [
        (c) => `No vuelvas a aplazar ${c.focus}.`,
        (c) => `Tu palabra vale cuando la cumples.`,
        (c) => `Si lo dejas para despues, pagas despues.`,
        (c) => `Hoy se evita otro arrepentimiento inutil.`,
        (c) => `No lo tapes con excusas suaves.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Si no lo haces, ${c.loss}.`,
        (c) => `Hazlo ahora y recupera control.`,
        (c) => `Una accion hoy te evita culpa hoy.`,
        (c) => `El costo de no hacerlo ya lo conoces.`,
      ],
      finish: [
        () => `Hazte cargo.`,
        () => `Sin rodeos.`,
        () => `Empieza ya.`,
        () => `No lo patees otra vez.`,
      ],
      cap: 72,
    },
    1: {
      lead: [
        (c) => `Otra vez huyendo de ${c.focus}?`,
        (c) => `Ya sabes lo que toca y aun asi aplazas.`,
        (c) => `No te escondas en la demora.`,
        (c) => `Tu orgullo no se sostiene con promesas.`,
        (c) => `Basta de teatro con tus excusas.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Si hoy no cumples, ${c.loss}.`,
        (c) => `Hazlo y deja de sabotearte.`,
        (c) => `No necesitas otra charla, necesitas ejecucion.`,
        (c) => `Cada minuto aplazado te hace ver pequeno.`,
      ],
      finish: [
        () => `Muevete.`,
        () => `Ya.`,
        () => `Sin cuento.`,
        () => `Demuestrate algo.`,
      ],
      cap: 74,
    },
    2: {
      lead: [
        (c) => `Cada aplazo en ${c.focus} confirma mediocridad.`,
        (c) => `Te dices fuerte, pero hoy te escondes?`,
        (c) => `Tus excusas se oyen mejor que tus resultados.`,
        (c) => `Hablar mucho no tapa ejecutar poco.`,
        (c) => `La comodidad te esta ganando otra vez.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Si no lo haces, ${c.loss}.`,
        (c) => `Hoy o confirmas fuerza o confirmas debilidad.`,
        (c) => `Tu orgullo deberia picarte leyendo esto.`,
        (c) => `Deja la pose y produce accion real.`,
      ],
      finish: [
        () => `Corrigelo ahora.`,
        () => `Sin negociar.`,
        () => `Sin victimismo.`,
        () => `No manana: ahora.`,
      ],
      cap: 76,
    },
    3: {
      lead: [
        (c) => `Mucho ego, poca ejecucion en ${c.focus}.`,
        (c) => `Te duele leer esto porque es verdad.`,
        (c) => `Hablas como ganador, actuas como espectador.`,
        (c) => `Tu problema no es tiempo: es cobardia para actuar.`,
        (c) => `Te esta ganando una tarea minima otra vez.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Si hoy te escondes, ${c.loss}.`,
        (c) => `Tu orgullo deberia arder con esta realidad.`,
        (c) => `Sigue aplazando y confirma que no mandas en tu vida.`,
        (c) => `Ahora defines si eres serio o puro ruido.`,
      ],
      finish: [
        () => `Muevete ya.`,
        () => `Demuestralo ahora.`,
        () => `Sin llanto, con accion.`,
        () => `Hazlo y calla la excusa.`,
      ],
      cap: 80,
    },
  },
};

const EN_TEMPLATES: StyleTemplateSet = {
  positive: {
    0: {
      lead: [
        (c) => `Today is for ${c.focus}.`,
        (c) => `Your day improves when you execute ${c.focus}.`,
        (c) => `One real step in ${c.focus} beats endless planning.`,
        () => `Progress starts with your next action.`,
        (c) => `${c.identity} shows up when you act.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Do it and ${c.win}.`,
        () => `One clean action changes your momentum.`,
        (c) => `Small move, big impact: ${c.action}.`,
        () => `Consistency is built today.`,
      ],
      finish: [
        () => `No rush, no pause.`,
        () => `Your future self will thank you.`,
        () => `This one counts.`,
        () => `Take a clean win.`,
      ],
      cap: 70,
    },
    1: {
      lead: [
        (c) => `You say ${c.focus} matters.`,
        () => `If you want change, move now.`,
        () => `This is not about mood, this is about standards.`,
        () => `Your talk is verified by execution.`,
        () => `Today shows whether you are serious.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Do it and ${c.win}.`,
        () => `Your level rises when you follow through.`,
        () => `Short action now, confidence later.`,
        () => `Your identity improves when you execute.`,
      ],
      finish: [
        () => `Cut the noise and execute.`,
        () => `This defines you.`,
        () => `No drama.`,
        () => `Do it right and keep moving.`,
      ],
      cap: 70,
    },
    2: {
      lead: [
        (c) => `Your standard in ${c.focus} is decided now.`,
        () => `Every excuse you cut makes you stronger.`,
        () => `Do not wait for motivation. Produce results.`,
        () => `This is where serious people separate themselves.`,
        () => `Your growth speed depends on this moment.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Do it and ${c.win}.`,
        () => `Execute today so you do not slide tomorrow.`,
        () => `Discipline is trained in moments like this.`,
        () => `Immediate action puts you ahead.`,
      ],
      finish: [
        () => `No negotiation.`,
        () => `High standard, high action.`,
        () => `Do not hold back.`,
        () => `Execute and advance.`,
      ],
      cap: 72,
    },
    3: {
      lead: [
        () => `You want elite results?`,
        () => `Soft excuses are over.`,
        () => `Break your ceiling now or keep it forever.`,
        () => `Your elite version does not ask permission.`,
        () => `This minute decides your narrative.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `Do it and ${c.win}.`,
        (c) => `Brutal execution in ${c.focus}.`,
        () => `Become someone more serious today.`,
        () => `Your identity is forged by immediate action.`,
      ],
      finish: [
        () => `Now.`,
        () => `No pause.`,
        () => `No permission.`,
        () => `No looking back.`,
      ],
      cap: 72,
    },
  },
  negative: {
    0: {
      lead: [
        (c) => `Do not delay ${c.focus} again.`,
        () => `Your word matters only when you keep it.`,
        () => `Push it later and you pay later.`,
        () => `Avoid another pointless regret loop today.`,
        () => `Do not hide behind soft excuses.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `If you skip this, ${c.loss}.`,
        () => `Do it now and regain control.`,
        () => `One action now saves guilt later.`,
        () => `You already know the cost of not doing it.`,
      ],
      finish: [
        () => `Own it.`,
        () => `No detours.`,
        () => `Start now.`,
        () => `Do not kick it down the road again.`,
      ],
      cap: 72,
    },
    1: {
      lead: [
        (c) => `Avoiding ${c.focus} again?`,
        () => `You know exactly what to do and still stall.`,
        () => `Stop hiding inside delay.`,
        () => `Pride is not built with promises.`,
        () => `Enough theater with your excuses.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `If you skip today, ${c.loss}.`,
        () => `Execute and stop sabotaging yourself.`,
        () => `You do not need another speech. You need action.`,
        () => `Every delayed minute makes you look smaller.`,
      ],
      finish: [
        () => `Move.`,
        () => `Now.`,
        () => `No stories.`,
        () => `Prove something to yourself.`,
      ],
      cap: 74,
    },
    2: {
      lead: [
        (c) => `Every delay in ${c.focus} confirms mediocrity.`,
        () => `You call yourself strong, but hide now?`,
        () => `Your excuses are louder than your results.`,
        () => `Big talk does not hide small execution.`,
        () => `Comfort is beating you again.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `If you skip this, ${c.loss}.`,
        () => `Today you confirm strength or weakness.`,
        () => `Your pride should sting reading this.`,
        () => `Drop the act and produce real action.`,
      ],
      finish: [
        () => `Fix it now.`,
        () => `No negotiation.`,
        () => `No victim mode.`,
        () => `Not tomorrow: now.`,
      ],
      cap: 76,
    },
    3: {
      lead: [
        (c) => `Big ego, low execution in ${c.focus}.`,
        () => `This hurts because it is true.`,
        () => `You talk like a winner and act like a spectator.`,
        () => `Your problem is not time; it is fear of acting.`,
        () => `A tiny task is beating you again.`,
      ],
      thrust: [
        (c) => `${c.action}.`,
        (c) => `If you hide today, ${c.loss}.`,
        () => `Your pride should burn reading this reality.`,
        () => `Keep delaying and prove you do not run your own life.`,
        () => `Right now you decide: serious or noise.`,
      ],
      finish: [
        () => `Move now.`,
        () => `Prove it now.`,
        () => `No whining, just action.`,
        () => `Execute and silence the excuse.`,
      ],
      cap: 80,
    },
  },
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function buildPool(copy: CategoryCopy, set: PhraseSet): string[] {
  const out: string[] = [];

  for (const lead of set.lead) {
    for (const thrust of set.thrust) {
      for (const finish of set.finish) {
        out.push(`${lead(copy)} ${thrust(copy)} ${finish(copy)}`.replace(/\s+/g, ' ').trim());
      }
    }
  }

  return unique(out).slice(0, set.cap);
}

function buildStyleMessages(
  templates: Record<ToneLevel, PhraseSet>,
  copyMap: Record<HabitCategory, CategoryCopy>
): StyleMessageSet {
  return {
    0: buildCategoryMessages(templates[ 0 ], copyMap),
    1: buildCategoryMessages(templates[ 1 ], copyMap),
    2: buildCategoryMessages(templates[ 2 ], copyMap),
    3: buildCategoryMessages(templates[ 3 ], copyMap),
  };
}

function buildCategoryMessages(
  phraseSet: PhraseSet,
  copyMap: Record<HabitCategory, CategoryCopy>
): CategoryMessageSet {
  return {
    study: buildPool(copyMap.study, phraseSet),
    exercise: buildPool(copyMap.exercise, phraseSet),
    health: buildPool(copyMap.health, phraseSet),
    work: buildPool(copyMap.work, phraseSet),
    personal: buildPool(copyMap.personal, phraseSet),
    discipline: buildPool(copyMap.discipline, phraseSet),
  };
}

function buildLocaleMessages(
  templates: StyleTemplateSet,
  copyMap: Record<HabitCategory, CategoryCopy>
): LocaleMessageSet {
  return {
    positive: buildStyleMessages(templates.positive, copyMap),
    negative: buildStyleMessages(templates.negative, copyMap),
  };
}

const LOCALE_MESSAGES: Record<AppLocale, LocaleMessageSet> = {
  es: buildLocaleMessages(ES_TEMPLATES, ES_COPY),
  en: buildLocaleMessages(EN_TEMPLATES, EN_COPY),
  ar: buildLocaleMessages(EN_TEMPLATES, EN_COPY),
};

function getMessagePool(
  locale: AppLocale,
  toneLevel: ToneLevel,
  motivationStyle: MotivationStyle,
  category: HabitCategory
) {
  return (LOCALE_MESSAGES[ locale ] ?? LOCALE_MESSAGES.en)[ motivationStyle ][ toneLevel ][ category ];
}

function getCustomMessagePool(
  customRules: CustomMessageRule[] | undefined,
  motivationStyle: MotivationStyle,
  toneLevel: ToneLevel,
  category: HabitCategory
) {
  if (!customRules?.length) return [];

  const matching = customRules
    .filter((rule) =>
      rule.enabled &&
      rule.text.trim().length > 0 &&
      rule.styles.includes(motivationStyle) &&
      rule.tones.includes(toneLevel) &&
      rule.categories.includes(category)
    )
    .map((rule) => ({
      text: rule.text.trim(),
      score: rule.styles.length + rule.tones.length + rule.categories.length,
    }));

  if (!matching.length) return [];

  const bestScore = Math.min(...matching.map((row) => row.score));
  return unique(matching.filter((row) => row.score === bestScore).map((row) => row.text));
}

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

const RECENT_MEMORY: Record<string, string[]> = {};
const RECENT_MEMORY_SIZE = 10;

function pickNonRepeating(key: string, pool: string[]) {
  if (!pool.length) return '';

  const recent = RECENT_MEMORY[ key ] ?? [];
  const available = pool.filter((msg) => !recent.includes(msg));
  const source = available.length ? available : pool;
  const chosen = source[ randomIndex(source.length) ];

  RECENT_MEMORY[ key ] = [ chosen, ...recent.filter((msg) => msg !== chosen) ].slice(0, RECENT_MEMORY_SIZE);
  return chosen;
}

export function pickMotivationMessage(
  locale: AppLocale,
  toneLevel: ToneLevel,
  motivationStyle: MotivationStyle,
  category: HabitCategory,
  customRules?: CustomMessageRule[]
) {
  const customPool = getCustomMessagePool(customRules, motivationStyle, toneLevel, category);
  const pool = customPool.length ? customPool : getMessagePool(locale, toneLevel, motivationStyle, category);
  const sourceTag = customPool.length ? 'custom' : 'system';
  const comboKey = `${sourceTag}:${locale}:${motivationStyle}:${toneLevel}:${category}`;
  return pickNonRepeating(comboKey, pool);
}

export function getMotivationMessagePreview(
  locale: AppLocale,
  toneLevel: ToneLevel,
  motivationStyle: MotivationStyle,
  category: HabitCategory = 'study',
  customRules?: CustomMessageRule[]
) {
  const customPool = getCustomMessagePool(customRules, motivationStyle, toneLevel, category);
  const pool = customPool.length ? customPool : getMessagePool(locale, toneLevel, motivationStyle, category);
  return pool[ 0 ] ?? '';
}

export function pickRageMessage(
  locale: AppLocale,
  toneLevel: ToneLevel,
  category: HabitCategory = 'study',
  customRules?: CustomMessageRule[]
) {
  return pickMotivationMessage(locale, toneLevel, 'negative', category, customRules);
}

export function getMessageCountPerCombo() {
  return getMessagePool('es', 3, 'negative', 'study').length;
}

export function getSupportedCategories() {
  return CATEGORIES;
}
