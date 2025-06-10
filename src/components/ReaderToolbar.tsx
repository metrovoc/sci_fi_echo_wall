import { useState } from "react";
import { Book } from "@/types";
import { useReader } from "@/contexts/ReaderContext";
import { cn } from "@/lib/utils";

interface ReaderToolbarProps {
  book: Book;
  onToggleSidebar: () => void;
}

export function ReaderToolbar({ book, onToggleSidebar }: ReaderToolbarProps) {
  const { state, updateSettings } = useReader();
  const [showSettings, setShowSettings] = useState(false);

  const themeOptions = [
    { value: "auto", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  const fontFamilyOptions = [
    { value: "serif", label: "Serif" },
    { value: "sans-serif", label: "Sans-serif" },
    { value: "mono", label: "Monospace" },
  ];

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Menu and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle sidebar"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold truncate max-w-md">
              {book.title}
            </h1>
          </div>
        </div>

        {/* Right side - Settings */}
        <div className="flex items-center space-x-2">
          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Settings"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Settings panel */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50">
                <div className="p-4 space-y-6">
                  <h3 className="text-lg font-semibold">Reader Settings</h3>

                  {/* Theme */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Theme
                    </label>
                    <div className="flex space-x-2">
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateSettings({ theme: option.value as any })
                          }
                          className={cn(
                            "px-3 py-2 text-sm rounded-md border transition-colors",
                            state.settings.theme === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-accent"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Font Size
                    </label>
                    <div className="flex space-x-2">
                      {fontSizeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateSettings({ fontSize: option.value as any })
                          }
                          className={cn(
                            "px-3 py-2 text-sm rounded-md border transition-colors",
                            state.settings.fontSize === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-accent"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Font Family
                    </label>
                    <div className="flex space-x-2">
                      {fontFamilyOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateSettings({ fontFamily: option.value as any })
                          }
                          className={cn(
                            "px-3 py-2 text-sm rounded-md border transition-colors",
                            state.settings.fontFamily === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-accent"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Line Height: {state.settings.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.4"
                      step="0.1"
                      value={state.settings.lineHeight}
                      onChange={(e) =>
                        updateSettings({
                          lineHeight: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Max Width */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Reading Width
                    </label>
                    <select
                      value={state.settings.maxWidth}
                      onChange={(e) =>
                        updateSettings({ maxWidth: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="600px">Narrow</option>
                      <option value="800px">Medium</option>
                      <option value="1000px">Wide</option>
                      <option value="100%">Full Width</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
