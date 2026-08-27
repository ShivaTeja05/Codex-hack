export function MockChip({ children = 'Simulated' }: { children?: React.ReactNode }) {
  return <span className="mock-chip">{children}</span>;
}
