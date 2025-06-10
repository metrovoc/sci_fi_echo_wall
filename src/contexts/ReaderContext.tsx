import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ReaderSettings, ReadingProgress } from "@/types";

interface ReaderState {
  settings: ReaderSettings;
  currentChapterId: string | null;
  progress: ReadingProgress[];
  isLoading: boolean;
  error: string | null;
}

type ReaderAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_CHAPTER"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<ReaderSettings> }
  | { type: "UPDATE_PROGRESS"; payload: ReadingProgress }
  | { type: "LOAD_PROGRESS"; payload: ReadingProgress[] };

const initialSettings: ReaderSettings = {
  theme: "auto",
  fontSize: "medium",
  fontFamily: "serif",
  lineHeight: 1.8,
  maxWidth: "800px",
};

const initialState: ReaderState = {
  settings: initialSettings,
  currentChapterId: null,
  progress: [],
  isLoading: false,
  error: null,
};

function readerReducer(state: ReaderState, action: ReaderAction): ReaderState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_CURRENT_CHAPTER":
      return { ...state, currentChapterId: action.payload };
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case "UPDATE_PROGRESS":
      const existingIndex = state.progress.findIndex(
        (p) => p.chapterId === action.payload.chapterId
      );

      if (existingIndex >= 0) {
        // Update existing progress
        const newProgress = [...state.progress];
        newProgress[existingIndex] = action.payload;
        return {
          ...state,
          progress: newProgress,
        };
      } else {
        // Add new progress
        return {
          ...state,
          progress: [...state.progress, action.payload],
        };
      }
    case "LOAD_PROGRESS":
      return { ...state, progress: action.payload };
    default:
      return state;
  }
}

interface ReaderContextType {
  state: ReaderState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentChapter: (chapterId: string) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  updateProgress: (progress: ReadingProgress) => void;
  getProgress: (chapterId: string) => ReadingProgress | undefined;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(readerReducer, initialState);

  // Load settings and progress from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("reader-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: "UPDATE_SETTINGS", payload: settings });
      } catch (error) {
        console.warn("Failed to load settings from localStorage");
      }
    }

    const savedProgress = localStorage.getItem("reading-progress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        dispatch({ type: "LOAD_PROGRESS", payload: progress });
      } catch (error) {
        console.warn("Failed to load progress from localStorage");
      }
    }
  }, []);

  // Save settings to localStorage when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("reader-settings", JSON.stringify(state.settings));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    state.settings.theme,
    state.settings.fontSize,
    state.settings.fontFamily,
    state.settings.lineHeight,
    state.settings.maxWidth,
  ]);

  // Save progress to localStorage when it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("reading-progress", JSON.stringify(state.progress));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state.progress.length]);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = state.settings;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // Auto theme based on system preference
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkModeQuery.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    applyTheme();

    if (state.settings.theme === "auto") {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", applyTheme);
      return () => darkModeQuery.removeEventListener("change", applyTheme);
    }
  }, [state.settings.theme]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setCurrentChapter = useCallback((chapterId: string) => {
    dispatch({ type: "SET_CURRENT_CHAPTER", payload: chapterId });
  }, []);

  const updateSettings = useCallback((settings: Partial<ReaderSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  }, []);

  const updateProgress = useCallback((progress: ReadingProgress) => {
    dispatch({ type: "UPDATE_PROGRESS", payload: progress });
  }, []);

  const getProgress = useCallback(
    (chapterId: string): ReadingProgress | undefined => {
      return state.progress.find((p) => p.chapterId === chapterId);
    },
    [state.progress]
  );

  const value: ReaderContextType = {
    state,
    setLoading,
    setError,
    setCurrentChapter,
    updateSettings,
    updateProgress,
    getProgress,
  };

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return context;
}
