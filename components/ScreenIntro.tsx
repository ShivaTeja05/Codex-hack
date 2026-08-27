export function ScreenIntro({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="screen-intro">
      <p className="eyebrow">{step}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
