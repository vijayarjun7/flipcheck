export function HighlightText({ text, fragment }: { text: string; fragment: string }) {
  if (!fragment) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(fragment.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[#fab219]/30 px-0.5 text-[#fab219]">{text.slice(idx, idx + fragment.length)}</mark>
      {text.slice(idx + fragment.length)}
    </>
  );
}
