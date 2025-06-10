import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Book } from "@/types";
import { useReader } from "@/contexts/ReaderContext";
import { BookLoader } from "@/lib/bookLoader";
import { debounce, cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { ReaderToolbar } from "./ReaderToolbar";
import { ChapterNavigation } from "./ChapterNavigation";

interface BookReaderProps {
  className?: string;
}

export function BookReader({ className }: BookReaderProps) {
  const {
    state,
    setLoading,
    setError,
    setCurrentChapter,
    updateProgress,
    getProgress,
  } = useReader();
  const [book, setBook] = useState<Book | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Immersive reading state
  const [showToolbar, setShowToolbar] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false); // Track if user is at page bottom
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMouseY = useRef<number>(0); // Track current mouse position
  const isManualNavigation = useRef<boolean>(false); // Track if it's a manual navigation

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Auto-hide functionality
  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowToolbar(false);
      // Only hide navigation if not at bottom
      if (!isAtBottom) {
        setShowNavigation(false);
      }
    }, 0); // Hide after 0 seconds of inactivity
  }, [isAtBottom]);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Mouse move handler for detecting proximity to edges
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const EDGE_THRESHOLD = 80; // pixels from edge
      const { clientY } = e;
      currentMouseY.current = clientY; // Track current mouse position
      const windowHeight = window.innerHeight;
      const nearTop = clientY <= EDGE_THRESHOLD;
      const nearBottom = clientY >= windowHeight - EDGE_THRESHOLD;

      // If at bottom, only handle top edge for toolbar
      if (isAtBottom) {
        if (nearTop) {
          setShowToolbar(true);
          cancelHide();
        } else {
          if (showToolbar) {
            scheduleHide();
          }
        }
        // Navigation is handled by scroll logic when at bottom
        return;
      }

      // Normal mouse logic when not at bottom
      if (nearTop) {
        setShowToolbar(true);
        cancelHide();
      } else if (nearBottom) {
        setShowNavigation(true);
        cancelHide();
      } else {
        // Not near any edge, schedule hide for both if they're visible
        if (showToolbar || showNavigation) {
          scheduleHide();
        }
      }
    },
    [isAtBottom, showToolbar, showNavigation, scheduleHide, cancelHide]
  );

  // Setup mouse move listener
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  // Check current mouse position when isAtBottom changes
  useEffect(() => {
    if (!isAtBottom && currentMouseY.current > 0) {
      // When leaving bottom state, check if mouse is in bottom area
      const EDGE_THRESHOLD = 80;
      const windowHeight = window.innerHeight;
      const nearBottom = currentMouseY.current >= windowHeight - EDGE_THRESHOLD;

      if (!nearBottom && showNavigation) {
        // Mouse is not in bottom area, start hiding navigation
        scheduleHide();
      } else if (nearBottom) {
        // Mouse is in bottom area, keep navigation visible
        cancelHide();
      }
    }
  }, [isAtBottom, showNavigation, scheduleHide, cancelHide]);

  // Load book on component mount
  useEffect(() => {
    const loadBookData = async () => {
      setLoading(true);
      try {
        const bookLoader = BookLoader.getInstance();
        const bookData = await bookLoader.loadBook();
        setBook(bookData);

        if (bookData.chapters.length > 0) {
          // For initial load, allow progress restoration
          isManualNavigation.current = false;
          setCurrentChapter(bookData.chapters[0].id);
          setCurrentChapterIndex(0);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load book"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, []); // Remove dependencies to run only once on mount

  // Restore reading progress when chapter changes
  useEffect(() => {
    if (
      state.currentChapterId &&
      contentRef.current &&
      !isManualNavigation.current
    ) {
      const progress = getProgress(state.currentChapterId);
      if (progress) {
        setTimeout(() => {
          if (contentRef.current && !isManualNavigation.current) {
            contentRef.current.scrollTop = progress.scrollPosition;
          }
        }, 100);
      }
    }
    // Reset the flag after handling
    isManualNavigation.current = false;
  }, [state.currentChapterId, getProgress]);

  // Track reading progress and scroll position
  const trackProgress = useCallback(
    debounce(() => {
      if (state.currentChapterId && contentRef.current) {
        const scrollPosition = contentRef.current.scrollTop;
        updateProgress({
          chapterId: state.currentChapterId,
          scrollPosition,
          timestamp: Date.now(),
        });
      }
    }, 1000),
    [state.currentChapterId] // Remove updateProgress from dependencies since it's stable
  );

  const handleScroll = useCallback(() => {
    trackProgress();

    // Check if at bottom - this logic has priority over mouse position
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const BOTTOM_THRESHOLD = 100; // pixels from bottom
      const isCurrentlyAtBottom =
        scrollTop + clientHeight >= scrollHeight - BOTTOM_THRESHOLD;

      if (isCurrentlyAtBottom !== isAtBottom) {
        setIsAtBottom(isCurrentlyAtBottom);

        if (isCurrentlyAtBottom) {
          // At bottom: always show navigation, cancel any hide timer
          setShowNavigation(true);
          cancelHide();
        } else {
          // Left bottom: clear the bottom state and actively check if should hide
          // Start hide timer immediately, let mouse logic cancel it if needed
          scheduleHide();
        }
      }
    }
  }, [trackProgress, cancelHide, isAtBottom, scheduleHide]);

  const currentChapter = book?.chapters.find(
    (ch) => ch.id === state.currentChapterId
  );

  const navigateToChapter = (
    chapterId: string,
    restoreProgress: boolean = false
  ) => {
    const index = book?.chapters.findIndex((ch) => ch.id === chapterId) ?? -1;
    if (index !== -1) {
      // Set flag to control progress restoration
      isManualNavigation.current = !restoreProgress;
      setCurrentChapter(chapterId);
      setCurrentChapterIndex(index);
      setSidebarOpen(false);

      // Use setTimeout to ensure scroll happens after DOM update
      if (!restoreProgress) {
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = 0;
          }
        }, 0);
      }

      // Show toolbar briefly when navigating
      setShowToolbar(true);
      scheduleHide();
    }
  };

  const nextChapter = () => {
    if (book && currentChapterIndex < book.chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      navigateToChapter(book.chapters[nextIndex].id);
    }
  };

  const previousChapter = () => {
    if (book && currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      navigateToChapter(book.chapters[prevIndex].id);
    }
  };

  // Handle toolbar and navigation interactions
  const handleToolbarInteraction = () => {
    setShowToolbar(true);
    cancelHide();
    scheduleHide();
  };

  const handleNavigationInteraction = () => {
    setShowNavigation(true);
    cancelHide();
    scheduleHide();
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            Error Loading Book
          </h2>
          <p className="text-muted-foreground mb-6">{state.error}</p>
          <div className="space-y-4">
            <p className="text-sm">To use this book reader:</p>
            <ol className="text-sm text-left space-y-2">
              <li>1. Create a `contents` folder in your repository</li>
              <li>
                2. Add your Markdown files (e.g., chapter1.md, chapter2.md)
              </li>
              <li>
                3. Optionally create config.json and index.json for
                customization
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!book || !currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Found</h2>
          <p className="text-muted-foreground">
            Please add Markdown files to the contents folder.
          </p>
        </div>
      </div>
    );
  }

  const fontFamilyClass = {
    serif: "font-serif",
    "sans-serif": "font-sans",
    mono: "font-mono",
  }[state.settings.fontFamily];

  // Calculate font size in pixels for more control
  const getFontSize = (size: string) => {
    switch (size) {
      case "small":
        return "14px";
      case "medium":
        return "16px";
      case "large":
        return "20px";
      default:
        return "16px";
    }
  };

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      <Sidebar
        book={book}
        currentChapterId={state.currentChapterId}
        onChapterSelect={navigateToChapter}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out relative",
          { "lg:ml-80": sidebarOpen }
        )}
      >
        {/* Toolbar - Fixed position with conditional visibility */}
        <div
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
            sidebarOpen ? "lg:left-80" : "left-0",
            showToolbar ? "translate-y-0" : "-translate-y-full"
          )}
          onMouseEnter={handleToolbarInteraction}
          onMouseLeave={() => scheduleHide()}
        >
          <ReaderToolbar
            book={book}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Reading Area - Full height without toolbar */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={contentRef}
            className="h-full overflow-y-auto px-6 py-8"
            onScroll={handleScroll}
          >
            <div
              className={`mx-auto prose prose-slate dark:prose-invert ${fontFamilyClass}`}
              style={{
                maxWidth: state.settings.maxWidth,
                lineHeight: state.settings.lineHeight,
                fontSize: getFontSize(state.settings.fontSize),
                paddingTop: "2rem", // Add top padding for better reading experience
                paddingBottom: "4rem", // Add bottom padding
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {currentChapter.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Chapter Navigation - Fixed position with conditional visibility */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
            sidebarOpen ? "lg:left-80" : "left-0",
            showNavigation ? "translate-y-0" : "translate-y-full"
          )}
          onMouseEnter={handleNavigationInteraction}
          onMouseLeave={() => scheduleHide()}
        >
          <ChapterNavigation
            currentChapterIndex={currentChapterIndex}
            totalChapters={book.chapters.length}
            onPrevious={previousChapter}
            onNext={nextChapter}
            hasNext={currentChapterIndex < book.chapters.length - 1}
            hasPrevious={currentChapterIndex > 0}
          />
        </div>
      </div>
    </div>
  );
}
