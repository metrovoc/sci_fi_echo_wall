import { Book, Chapter, BookConfig } from "@/types";

export class BookLoader {
  private static instance: BookLoader;
  private book: Book | null = null;
  private config: BookConfig | null = null;

  static getInstance(): BookLoader {
    if (!BookLoader.instance) {
      BookLoader.instance = new BookLoader();
    }
    return BookLoader.instance;
  }

  async loadBook(): Promise<Book> {
    if (this.book) {
      return this.book;
    }

    try {
      // Load book configuration
      await this.loadConfig();

      // Load chapters from contents directory
      const chapters = await this.loadChapters();

      this.book = {
        title: this.config?.title || "Untitled Book",
        author: this.config?.author,
        description: this.config?.description,
        chapters: chapters.sort((a, b) => a.order - b.order),
      };

      return this.book;
    } catch (error) {
      console.error("Failed to load book:", error);
      throw new Error("Failed to load book content");
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch("./contents/config.json");
      if (response.ok) {
        this.config = await response.json();
      } else {
        // Use default config if not found
        this.config = {
          title: "My Book",
          author: "Unknown Author",
          description: "A wonderful book created with Markdown Book Publisher",
        };
      }
    } catch (error) {
      console.warn("No config.json found, using defaults");
      this.config = {
        title: "My Book",
        author: "Unknown Author",
        description: "A wonderful book created with Markdown Book Publisher",
      };
    }
  }

  private async loadChapters(): Promise<Chapter[]> {
    try {
      // Load chapters index from contents directory
      const indexResponse = await fetch("./contents/index.json");
      if (indexResponse.ok) {
        const index = await indexResponse.json();
        return await this.loadChaptersFromIndex(index);
      } else {
        console.error(
          "Fatal: index.json not found. The book content cannot be loaded. Ensure the build process is correct."
        );
        return [];
      }
    } catch (error) {
      console.error("Failed to load or parse index.json:", error);
      return [];
    }
  }

  private async loadChaptersFromIndex(index: {
    files: string[];
  }): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    for (let i = 0; i < index.files.length; i++) {
      const fileName = index.files[i];
      try {
        const response = await fetch(`./contents/${fileName}`);
        if (response.ok) {
          const content = await response.text();
          const title = this.extractTitle(content, fileName);

          chapters.push({
            id: `chapter-${i + 1}`,
            title,
            content,
            order: i + 1,
            fileName,
          });
        }
      } catch (error) {
        console.warn(`Failed to load chapter: ${fileName}`);
      }
    }

    return chapters;
  }

  private extractTitle(content: string, fileName: string): string {
    // Try to extract title from first h1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Try to extract title from first h2 heading
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) {
      return h2Match[1].trim();
    }

    // Fallback to filename
    return fileName.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
  }

  getBook(): Book | null {
    return this.book;
  }

  getConfig(): BookConfig | null {
    return this.config;
  }
}
