import type { StepStatus } from './types';

/**
 * Partial, hand-checked translations for the track screen: the status block,
 * the status labels, and the step names of the primary demo scheme. Office
 * names, the access log and secondary screens stay in English — this is
 * disclosed on /whats-real. Rendered server-side from a `?lang=` param so the
 * page needs no client JavaScript and still works with scripts off.
 */

export type Lang = 'en' | 'hi' | 'kn';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export function asLang(value: string | undefined): Lang {
  return value === 'hi' || value === 'kn' ? value : 'en';
}

interface Strings {
  submitted: string;
  nowAt: string;
  sittingAt: string;
  forLabel: string;
  youNeed: string;
  nothing: string;
  replaceOne: string;
  usuallyTakes: string;
  day: string;
  days: string;
  doneIn: string;
  whoOpened: string;
  waiting: string;
  beingChecked: string;
  blocked: string;
  approved: string;
  waitingToStart: string;
  status: Record<StepStatus, string>;
  breach: (n: number) => string;
  langNote: string;
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    submitted: 'Submitted',
    nowAt: 'Now at',
    sittingAt: 'Sitting at',
    forLabel: 'For',
    youNeed: 'You need to do',
    nothing: 'nothing right now',
    replaceOne: 'Replace one document — see below',
    usuallyTakes: 'this step usually takes',
    day: 'day',
    days: 'days',
    doneIn: 'Done in',
    whoOpened: 'Who has opened your documents',
    waiting: 'waiting',
    beingChecked: 'being checked',
    blocked: 'blocked',
    approved: 'Approved',
    waitingToStart: 'Waiting to start',
    status: {
      NOT_STARTED: 'Not started',
      WAITING: 'Waiting in queue',
      IN_REVIEW: 'Being checked',
      ACTION_NEEDED: 'Action needed from you',
      DONE: 'Done',
    },
    breach: (n) => `Past its usual time by ${n} day${n === 1 ? '' : 's'}.`,
    langNote: '',
  },
  hi: {
    submitted: 'जमा किया गया',
    nowAt: 'अभी यहाँ है',
    sittingAt: 'यहाँ रुका है',
    forLabel: 'अवधि',
    youNeed: 'आपको करना है',
    nothing: 'अभी कुछ नहीं',
    replaceOne: 'एक दस्तावेज़ बदलें — नीचे देखें',
    usuallyTakes: 'इस चरण में आमतौर पर लगते हैं',
    day: 'दिन',
    days: 'दिन',
    doneIn: 'पूरा हुआ',
    whoOpened: 'आपके दस्तावेज़ किसने खोले',
    waiting: 'प्रतीक्षा',
    beingChecked: 'जाँच',
    blocked: 'अवरुद्ध',
    approved: 'स्वीकृत',
    waitingToStart: 'शुरू होने की प्रतीक्षा',
    status: {
      NOT_STARTED: 'शुरू नहीं हुआ',
      WAITING: 'कतार में प्रतीक्षारत',
      IN_REVIEW: 'जाँच हो रही है',
      ACTION_NEEDED: 'आपकी कार्रवाई आवश्यक',
      DONE: 'पूरा',
    },
    breach: (n) => `सामान्य समय से ${n} दिन अधिक।`,
    langNote: 'स्थिति और चरण के नाम हिंदी में हैं। कार्यालय के नाम और लॉग अंग्रेज़ी में हैं।',
  },
  kn: {
    submitted: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
    nowAt: 'ಈಗ ಇಲ್ಲಿದೆ',
    sittingAt: 'ಇಲ್ಲಿ ಉಳಿದಿದೆ',
    forLabel: 'ಅವಧಿ',
    youNeed: 'ನೀವು ಮಾಡಬೇಕಾದದ್ದು',
    nothing: 'ಈಗ ಏನೂ ಇಲ್ಲ',
    replaceOne: 'ಒಂದು ದಾಖಲೆ ಬದಲಾಯಿಸಿ — ಕೆಳಗೆ ನೋಡಿ',
    usuallyTakes: 'ಈ ಹಂತಕ್ಕೆ ಸಾಮಾನ್ಯವಾಗಿ ಬೇಕಾಗುವುದು',
    day: 'ದಿನ',
    days: 'ದಿನಗಳು',
    doneIn: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    whoOpened: 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಯಾರು ತೆರೆದಿದ್ದಾರೆ',
    waiting: 'ಕಾಯುವಿಕೆ',
    beingChecked: 'ಪರಿಶೀಲನೆ',
    blocked: 'ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ',
    approved: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    waitingToStart: 'ಪ್ರಾರಂಭವಾಗಲು ಕಾಯುತ್ತಿದೆ',
    status: {
      NOT_STARTED: 'ಪ್ರಾರಂಭವಾಗಿಲ್ಲ',
      WAITING: 'ಸಾಲಿನಲ್ಲಿ ಕಾಯುತ್ತಿದೆ',
      IN_REVIEW: 'ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ',
      ACTION_NEEDED: 'ನಿಮ್ಮ ಕ್ರಮ ಅಗತ್ಯ',
      DONE: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    },
    breach: (n) => `ಸಾಮಾನ್ಯ ಸಮಯಕ್ಕಿಂತ ${n} ದಿನ ಹೆಚ್ಚು.`,
    langNote: 'ಸ್ಥಿತಿ ಮತ್ತು ಹಂತದ ಹೆಸರುಗಳು ಕನ್ನಡದಲ್ಲಿವೆ. ಕಚೇರಿ ಹೆಸರುಗಳು ಮತ್ತು ಲಾಗ್ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿವೆ.',
  },
};

/**
 * Step-name translations keyed by the English plain name of the primary scheme.
 * Anything not listed (income certificate steps, freshly created applications)
 * falls back to English, by design.
 */
const STEP_NAMES: Record<string, { hi: string; kn: string }> = {
  'Application received': {
    hi: 'आवेदन प्राप्त हुआ',
    kn: 'ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
  },
  'Checking your ID and bank details': {
    hi: 'आपकी पहचान और बैंक विवरण की जाँच',
    kn: 'ನಿಮ್ಮ ಗುರುತು ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರ ಪರಿಶೀಲನೆ',
  },
  'Confirming you live in this district': {
    hi: 'आप इस ज़िले में रहते हैं, इसकी पुष्टि',
    kn: 'ನೀವು ಈ ಜಿಲ್ಲೆಯಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ ಎಂದು ದೃಢೀಕರಣ',
  },
  'Checking your family income': {
    hi: 'आपके परिवार की आय की जाँच',
    kn: 'ನಿಮ್ಮ ಕುಟುಂಬದ ಆದಾಯ ಪರಿಶೀಲನೆ',
  },
  'Checking your category certificate': {
    hi: 'आपके श्रेणी प्रमाणपत्र की जाँच',
    kn: 'ನಿಮ್ಮ ವರ್ಗ ಪ್ರಮಾಣಪತ್ರ ಪರಿಶೀಲನೆ',
  },
  'Checking your Class 12 marksheet': {
    hi: 'आपकी कक्षा 12 की अंकतालिका की जाँच',
    kn: 'ನಿಮ್ಮ 12ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ ಪರಿಶೀಲನೆ',
  },
  'Approving payment': {
    hi: 'भुगतान की स्वीकृति',
    kn: 'ಪಾವತಿ ಅನುಮೋದನೆ',
  },
};

const SCHEME_NAMES: Record<string, { hi: string; kn: string }> = {
  'Post-matric scholarship': {
    hi: 'पोस्ट-मैट्रिक छात्रवृत्ति',
    kn: 'ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ',
  },
};

export function tStep(plainName: string, lang: Lang): string {
  if (lang === 'en') return plainName;
  return STEP_NAMES[plainName]?.[lang] ?? plainName;
}

export function tScheme(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return SCHEME_NAMES[name]?.[lang] ?? name;
}
