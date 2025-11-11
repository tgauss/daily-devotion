'use client'

interface LessonAudioPlayerProps {
  audioUrl: string
}

export function LessonAudioPlayer({ audioUrl }: LessonAudioPlayerProps) {
  return (
    <audio controls className="w-full">
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  )
}
