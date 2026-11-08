export interface FoundationRecord {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}
export interface AppMetadata { key: string; value: string }
export const MAX_TEXT_LENGTH = 10000
export function validateText(text: string): void {
  if (!text.trim() || text.length > MAX_TEXT_LENGTH) throw new Error('Enter text between 1 and 10,000 characters.')
}
