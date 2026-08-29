import { NextResponse } from 'next/server';
import { findApplication, findScheme, findShareCode, state } from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { code: string } }) {
  const shareCode = findShareCode(params.code);
  if (!shareCode) return NextResponse.json({ error: 'Unknown code.' }, { status: 404 });

  const application = findApplication(shareCode.applicationId);
  const scheme = findScheme(application?.schemeId);
  const store = state();

  // The office that currently holds the file, so the demo logs a realistic actor.
  const pending = application?.steps.find((item) => item.enteredAt && !item.completedAt);
  const step = scheme?.steps.find((item) => item.id === pending?.workflowStepId);

  return NextResponse.json({
    code: shareCode.code,
    purpose: shareCode.purpose,
    office: step?.officeName ?? 'Reviewing office',
    documents: shareCode.docIds
      .map((id) => store.documents.find((document) => document.id === id))
      .filter(Boolean)
      .map((document) => ({
        id: document!.id,
        plainName: document!.plainName,
        issuer: document!.issuer,
        refMasked: document!.refMasked,
      })),
  });
}
