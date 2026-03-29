'use client'

interface AvatarGridProps {
  selectedId?: string
  onSelect: (avatarId: string) => void
}

const AVATARS = [
  { id: 'arnab', emoji: '🐰', label: 'Arnab' },
  { id: 'kucing', emoji: '🐱', label: 'Kucing' },
  { id: 'burung', emoji: '🐦', label: 'Burung' },
  { id: 'ikan', emoji: '🐟', label: 'Ikan' },
  { id: 'gajah', emoji: '🐘', label: 'Gajah' },
  { id: 'singa', emoji: '🦁', label: 'Singa' },
  { id: 'rama-rama', emoji: '🦋', label: 'Rama-rama' },
  { id: 'bintang', emoji: '⭐', label: 'Bintang' },
] as const

export function AvatarGrid({ selectedId, onSelect }: AvatarGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {AVATARS.map((avatar) => {
        const isSelected = selectedId === avatar.id
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            aria-label={avatar.label}
            className={`flex min-h-[64px] min-w-[64px] flex-col items-center justify-center rounded-2xl bg-white/90 p-3 shadow-lg transition-all duration-200 active:scale-95 ${
              isSelected
                ? 'scale-110 ring-4 ring-yellow-400 shadow-yellow-400/40'
                : 'hover:scale-105 hover:bg-white'
            }`}
          >
            <span className="text-4xl" role="img" aria-hidden>
              {avatar.emoji}
            </span>
            <span className="mt-1 text-xs font-semibold text-indigo-700">
              {avatar.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
