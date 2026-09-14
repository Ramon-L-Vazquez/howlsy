type HowlsyMarkProps = {
  className?: string;
};

export function HowlsyMark({
  className = "h-10 w-10",
}: HowlsyMarkProps) {
  return (
    <img
      src="/brand/icon.svg"
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}