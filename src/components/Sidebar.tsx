import { Book } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  book: Book;
  currentChapterId: string | null;
  onChapterSelect: (chapterId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  book,
  currentChapterId,
  onChapterSelect,
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold truncate">{book.title}</h1>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-accent rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {book.author && (
              <p className="text-sm text-muted-foreground mt-1">
                by {book.author}
              </p>
            )}
            {book.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {book.description}
              </p>
            )}
          </div>

          {/* Table of Contents */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Contents
              </h2>
              <nav className="space-y-1">
                {book.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => onChapterSelect(chapter.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      currentChapterId === chapter.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="truncate">{chapter.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              {book.chapters.length} chapter
              {book.chapters.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
