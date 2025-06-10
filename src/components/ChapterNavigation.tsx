import { cn } from "@/lib/utils";

interface ChapterNavigationProps {
  currentChapterIndex: number;
  totalChapters: number;
  onPrevious: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function ChapterNavigation({
  currentChapterIndex,
  totalChapters,
  onPrevious,
  onNext,
  hasNext,
  hasPrevious,
}: ChapterNavigationProps) {
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition-colors",
            hasPrevious
              ? "hover:bg-accent hover:text-accent-foreground text-foreground"
              : "text-muted-foreground cursor-not-allowed"
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Previous</span>
        </button>

        {/* Progress indicator */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Chapter {currentChapterIndex + 1} of {totalChapters}
          </span>

          {/* Progress bar */}
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentChapterIndex + 1) / totalChapters) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition-colors",
            hasNext
              ? "hover:bg-accent hover:text-accent-foreground text-foreground"
              : "text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Next</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
