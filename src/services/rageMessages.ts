import { AppLocale } from '../i18n';

type ToneLevel = 0 | 1 | 2 | 3;

const MESSAGES: Record<AppLocale, Record<ToneLevel, string[]>> = {
  en: {
    0: [ 'You got this. One small win today.', 'Keep it simple: show up.' ],
    1: [ 'Again? Let’s not pretend you forgot.', 'Be honest: do it now.' ],
    2: [ 'Discipline beats motivation. Move.', 'You said you wanted it. Prove it.' ],
    3: [ 'You can scroll later. Earn it first.', 'Stop negotiating with yourself.' ],
  },
  es: {
    0: [ 'Tú puedes. Una pequeña victoria hoy.', 'Simple: preséntate y hazlo.' ],
    1: [ '¿Otra vez? No finjamos que se te olvidó.', 'Sé honesto: hazlo ya.' ],
    2: [ 'La disciplina le gana a la motivación. Muévete.', 'Dijiste que lo querías. Demuéstralo.' ],
    3: [ 'El scroll puede esperar. Gánatelo primero.', 'Deja de negociar contigo.' ],
  },
  ar: {
    0: [ 'أنت قادر. فوز صغير اليوم.', 'ببساطة: ابدأ.' ],
    1: [ 'مرة أخرى؟ لا تتظاهر أنك نسيت.', 'كن صريحًا: افعلها الآن.' ],
    2: [ 'الانضباط أقوى من الحماس. تحرك.', 'قلت أنك تريده. أثبت ذلك.' ],
    3: [ 'التصفح لاحقًا. استحقه أولاً.', 'توقف عن المساومة مع نفسك.' ],
  },
};

export function pickRageMessage(locale: AppLocale, toneLevel: ToneLevel) {
  const arr = MESSAGES[ locale ][ toneLevel ];
  return arr[ Math.floor(Math.random() * arr.length) ];
}
