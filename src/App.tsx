import { ReaderProvider } from "./contexts/ReaderContext";
import { BookReader } from "./components/BookReader";

function App() {
  return (
    <ReaderProvider>
      <div className="min-h-screen bg-background text-foreground">
        <BookReader />
      </div>
    </ReaderProvider>
  );
}

export default App;
