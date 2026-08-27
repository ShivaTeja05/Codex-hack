async function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI explanation timed out')), milliseconds);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function callOpenAI(deterministic: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      input: `Rewrite this in short, plain language. Do not change the decision or add facts: ${deterministic}`,
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { output_text?: string };
  return data.output_text?.trim() || null;
}

export async function explain(deterministic: string): Promise<string> {
  try {
    const rewritten = await withTimeout(callOpenAI(deterministic), 3000);
    return rewritten ?? deterministic;
  } catch {
    return deterministic;
  }
}
