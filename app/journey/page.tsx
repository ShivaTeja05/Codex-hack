'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

/**
 * Guided journey, GOV.UK style: one plain-language question at a time. The
 * routing is deterministic so it never breaks. If an OpenAI key is present, we
 * ask it only to rewrite the recommendation in plainer language — never to make
 * the decision, and never with anything resembling personal data. Only the
 * broad band answers below ever leave the browser.
 */

type Answers = {
  studying?: 'yes' | 'no';
  level?: 'school' | 'college';
  state?: 'karnataka' | 'other';
  income?: 'low' | 'mid' | 'high';
};

type Question = {
  key: keyof Answers;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: 'studying',
    prompt: 'Are you studying right now?',
    hint: 'This helps us find schemes meant for students.',
    options: [
      { value: 'yes', label: 'Yes, I am a student' },
      { value: 'no', label: 'No, I am not studying' },
    ],
  },
  {
    key: 'level',
    prompt: 'What are you studying?',
    options: [
      { value: 'school', label: 'Class 11 or 12' },
      { value: 'college', label: 'College or diploma' },
    ],
  },
  {
    key: 'state',
    prompt: 'Which state do you live in?',
    hint: 'This demo carries Karnataka schemes. Production routes to your state.',
    options: [
      { value: 'karnataka', label: 'Karnataka' },
      { value: 'other', label: 'Another state' },
    ],
  },
  {
    key: 'income',
    prompt: "Roughly, what is your family's yearly income?",
    hint: 'A rough band is enough. We never ask for an exact figure.',
    options: [
      { value: 'low', label: 'Under ₹1 lakh' },
      { value: 'mid', label: '₹1 lakh to ₹2.5 lakh' },
      { value: 'high', label: 'Above ₹2.5 lakh' },
    ],
  },
];

type Result = {
  schemeId: string;
  title: string;
  reason: string;
  prerequisite?: string;
  docs: string[];
  steps: number;
  note?: string;
};

function decide(a: Answers): Result | null {
  if (a.studying === 'no') {
    return {
      schemeId: 'income-cert',
      title: 'Income certificate',
      reason:
        'You are not currently studying, so a student scholarship will not fit. An income certificate is the document most other schemes ask for first, so it is a useful place to start.',
      docs: ['Your government ID', 'Your ration card'],
      steps: 4,
    };
  }

  const highIncome = a.income === 'high';
  const otherState = a.state === 'other';

  return {
    schemeId: 'ka-post-matric',
    title: 'Post-matric scholarship',
    reason: highIncome
      ? 'You are a student, which fits this scholarship. Your income band is above the usual limit, so you may be asked for extra proof — but you can still apply and see exactly where it is reviewed.'
      : 'You are a student in Karnataka and your family income is within the usual limit for this scholarship. This is the closest match, and it has the fastest average processing of the schemes in this demo.',
    prerequisite:
      'This scholarship asks for an income certificate. If you do not have one yet, get that first — it is a separate 4-step application.',
    docs: [
      'Your government ID',
      'Your bank passbook',
      'Your domicile certificate',
      'Your ration card',
      'Your income certificate',
      'Your category certificate',
      'Your Class 12 marksheet',
    ],
    steps: 7,
    note: otherState
      ? 'You chose another state. This demo only carries Karnataka schemes, so we are showing the Karnataka version. In production this step routes to your own state’s equivalent scheme.'
      : undefined,
  };
}

export default function JourneyPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Which questions apply, given answers so far (level only if studying).
  const flow = useMemo(
    () => QUESTIONS.filter((q) => !(q.key === 'level' && answers.studying !== 'yes')),
    [answers.studying],
  );

  const nextIndex = flow.findIndex((q) => answers[q.key] === undefined);
  const done = nextIndex === -1;
  const result = done ? decide(answers) : null;
  const answeredCount = flow.filter((q) => answers[q.key] !== undefined).length;

  function choose(key: keyof Answers, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value } as Answers;
      // Changing an earlier answer clears later ones.
      if (key === 'studying') { delete next.level; }
      return next;
    });
    setAiReason(null);
  }

  async function plainer(reason: string) {
    setAiLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deterministic: reason }),
      });
      const data = (await res.json()) as { explanation?: string };
      setAiReason(data.explanation ?? reason);
    } catch {
      setAiReason(reason);
    } finally {
      setAiLoading(false);
    }
  }

  const current = flow[nextIndex];

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Find the right scheme</p>
      <h1 className="tr-h1">One question at a time</h1>
      <p className="tr-sub">
        You should not need to know which form to fill. Answer a few plain questions and
        we will route you to the scheme that fits — then straight into an application you
        can actually track.
      </p>

      <div className="jn-progress" aria-hidden="true">
        {flow.map((q, i) => (
          <span key={q.key} className={i <= answeredCount - (done ? 1 : 0) && (done || i < nextIndex) ? 'jn-dot jn-dot-on' : 'jn-dot'} />
        ))}
      </div>

      {!done && current ? (
        <section className="tr-now" key={current.key}>
          <h2 className="jn-q">{current.prompt}</h2>
          {current.hint ? <p className="tr-soft" style={{ margin: '6px 0 16px' }}>{current.hint}</p> : null}
          <div className="jn-options">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="jn-option"
                onClick={() => choose(current.key, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {nextIndex > 0 ? (
            <button
              type="button"
              className="jn-back"
              onClick={() => {
                const prevKey = flow[nextIndex - 1].key;
                setAnswers((prev) => {
                  const next = { ...prev };
                  delete next[prevKey];
                  return next;
                });
              }}
            >
              ← Change my last answer
            </button>
          ) : null}
        </section>
      ) : null}

      {done && result ? (
        <section className="tr-now">
          <p className="tr-eyebrow" style={{ marginBottom: 2 }}>Best match</p>
          <h2 className="tr-h2" style={{ marginBottom: 8 }}>{result.title}</h2>
          <p style={{ margin: '0 0 14px', fontSize: 16, lineHeight: 1.5 }}>
            {aiReason ?? result.reason}
          </p>

          {result.note ? <p className="tr-note">{result.note}</p> : null}
          {result.prerequisite ? (
            <p className="tr-note" style={{ background: '#FCF6F2', borderLeftColor: 'var(--thread)' }}>
              {result.prerequisite}
            </p>
          ) : null}

          <details className="jn-docs">
            <summary>Documents you will need ({result.docs.length})</summary>
            <ul>
              {result.docs.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <p className="tr-soft">
              All fetched from your locker with one share code. The code is both your
              submission and your status tracker.
            </p>
          </details>

          <div className="tr-actions" style={{ marginTop: 18 }}>
            <Link className="tr-btn" href={`/apply/${result.schemeId}`}>
              Start this application
            </Link>
            <button type="button" className="tr-btn tr-btn-ghost" onClick={() => plainer(result.reason)} disabled={aiLoading}>
              {aiLoading ? 'Rewriting…' : 'Explain this more simply'}
            </button>
          </div>
          <p className="tr-soft" style={{ marginTop: 12 }}>
            <button type="button" className="jn-back" onClick={() => { setAnswers({}); setAiReason(null); }}>
              ← Start over
            </button>
          </p>
        </section>
      ) : null}
    </main>
  );
}
