import { MoodInputInterface } from '@/components/mood'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Vibe-Song 🎵
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover music that matches your vibe
          </p>
        </div>

        {/* Mood Input Interface */}
        <div className="flex justify-center">
          <MoodInputInterface />
        </div>

        {/* Info Section */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Select your mood, adjust the sliders, and let us find the perfect music for you
          </p>
        </div>
      </div>
    </main>
  )
}
