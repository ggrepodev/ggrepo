export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-primary leading-none">
            ggrepo
          </h1>
          <p className="text-sm sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Merge your next PR with 10x speed
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Work in progress
      </footer>
    </div>
  );
}
