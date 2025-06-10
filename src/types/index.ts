export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  fileName: string;
}

export interface Book {
  title: string;
  author?: string;
  description?: string;
  chapters: Chapter[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface ReadingProgress {
  chapterId: string;
  scrollPosition: number;
  timestamp: number;
}

export interface BookConfig {
  title: string;
  author?: string;
  description?: string;
  cover?: string;
  theme?: "light" | "dark" | "auto";
  fontSize?: "small" | "medium" | "large";
  fontFamily?: "serif" | "sans-serif" | "mono";
}

export interface ReaderSettings {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  fontFamily: "serif" | "sans-serif" | "mono";
  lineHeight: number;
  maxWidth: string;
}
