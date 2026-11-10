// Existing UI convention: “MB” means MiB. One shared byte ceiling for all paths.
export const MAX_BACKUP_BYTES = 100 * 1024 * 1024
export const MAX_BACKUP_ROW_BYTES = 1024 * 1024
export const BACKUP_CHUNK_BYTES = 32 * 1024
export const BACKUP_PAGE_ROWS = 16
export function assertBackupSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 100 MB limit.')
}
/** Count UTF-8 without allocating a second file-sized byte array. */
export function utf8Bytes(text: string): number {
  let bytes = 0
  for (let i=0;i<text.length;i++) {
    const code=text.charCodeAt(i)
    if(code<0x80) bytes++
    else if(code<0x800) bytes+=2
    else if(code>=0xd800 && code<=0xdbff && i+1<text.length && text.charCodeAt(i+1)>=0xdc00 && text.charCodeAt(i+1)<=0xdfff) {bytes+=4;i++}
    else bytes+=3
  }
  return bytes
}
