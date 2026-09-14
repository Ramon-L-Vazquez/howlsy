import { HowlsyMark } from "@/components/brand/howlsy-mark";

type HowlsyLogoProps = {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
};

export function HowlsyLogo({
  className = "",
  markClassName = "h-10 w-10",
  showTagline = false,
}: HowlsyLogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-label="Howlsy"
    >
      <HowlsyMark className={markClassName} />

      <div className="min-w-0">
        <div className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Howlsy
        </div>

        {showTagline && (
          <div className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Don&apos;t know how? Easy.
          </div>
        )}
      </div>
    </div>
  );
}