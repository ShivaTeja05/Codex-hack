import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

export function resolveGoal(input: string): string {
  const goal = input.toLocaleLowerCase('en-IN');
  const scholarshipWords = ['scholarship', 'college', 'study', 'education', 'fees'];
  return scholarshipWords.some((word) => goal.includes(word))
    ? POST_MATRIC_SCHOLARSHIP_ID
    : POST_MATRIC_SCHOLARSHIP_ID;
}
