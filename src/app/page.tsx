export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          Vibe-Song 🎵
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Discover music that matches your vibe
        </p>
        <div className="bg-card border rounded-lg p-8 text-center">
          <p className="text-lg mb-4">
            Project setup complete! 🚀
          </p>
          <p className="text-sm text-muted-foreground">
            Ready to start building the MVP features
          </p>
        </div>
      </div>
    </main>
  )
}
