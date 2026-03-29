export interface Unlockable {
  id: string
  type: 'color' | 'sticker' | 'avatar_accessory'
  label: string
  value: string // hex color, sticker emoji, or accessory id
  requiredStars: number
}

export const UNLOCKABLES: Unlockable[] = [
  { id: 'color-gold', type: 'color', label: 'Emas', value: '#FFD700', requiredStars: 5 },
  { id: 'color-purple', type: 'color', label: 'Ungu', value: '#8b5cf6', requiredStars: 10 },
  { id: 'color-pink', type: 'color', label: 'Merah Jambu', value: '#ec4899', requiredStars: 15 },
  { id: 'color-rainbow', type: 'color', label: 'Pelangi', value: 'rainbow', requiredStars: 25 },
  { id: 'sticker-animals', type: 'sticker', label: 'Haiwan', value: '\u{1F981}\u{1F418}\u{1F98B}\u{1F41F}\u{1F430}\u{1F431}', requiredStars: 8 },
  { id: 'sticker-nature', type: 'sticker', label: 'Alam', value: '\u{1F338}\u{1F308}\u2B50\u{1F319}\u2600\uFE0F\u{1F30A}', requiredStars: 16 },
  { id: 'sticker-masjid', type: 'sticker', label: 'Masjid', value: '\u{1F54C}\u{1F319}\u2B50\u{1F4FF}\u{1F932}\u2728', requiredStars: 30 },
]

export function getUnlockedItems(totalStars: number): Unlockable[] {
  return UNLOCKABLES.filter(u => totalStars >= u.requiredStars)
}

export function getNextUnlock(totalStars: number): Unlockable | null {
  return UNLOCKABLES.find(u => totalStars < u.requiredStars) ?? null
}
