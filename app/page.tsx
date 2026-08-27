'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenIntro } from '@/components/ScreenIntro';
import { resolveGoal } from '@/lib/engine/goal';
import { useSession } from '@/lib/state';

const suggestions = [
  'Help with college fees',
  'Post-matric scholarship',
  'Check my study documents',
];

export default function GoalPage() {
  const router = useRouter();
  const { setGoalId } = useSession();
  const [goal, setGoal] = useState('');

  function continueJourney(event: FormEvent) {
    event.preventDefault();
    setGoalId(resolveGoal(goal));
    router.push('/connect');
  }

  return (
    <main className="page-shell landing-shell">
      <ScreenIntro step="1 of 8 · Your goal" title="Catch record problems before they stop you.">
        Tell us what you want to apply for. We will check the same details across your records.
      </ScreenIntro>
      <form className="card goal-form" onSubmit={continueJourney}>
        <label htmlFor="goal">What are you trying to do?</label>
        <input
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="For example: help with college fees"
          autoComplete="off"
        />
        <div className="chip-row" aria-label="Example goals">
          {suggestions.map((suggestion) => (
            <button type="button" className="choice-chip" key={suggestion} onClick={() => setGoal(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
        <button className="primary-button" type="submit">
          Check my records <span aria-hidden="true">→</span>
        </button>
      </form>
      <p className="footer-note">No details are saved. This journey uses fictional people and records.</p>
    </main>
  );
}
