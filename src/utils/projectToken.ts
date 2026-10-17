const SCRAMBLE_MULT = 0x45d9f3b
const UNSCRAMBLE_MULT = 0x119de1f3
const XOR_MASK = 0x5bf03635
const CHECKSUM_XOR = 0xa5a5a5a5
const CHECKSUM_MULT = 0x27d4eb2d

export function encodeProjectId(id: number): string {
  if (!id || id <= 0 || isNaN(id)) return ''
  const uintId = id >>> 0
  const scrambled = (Math.imul(uintId, SCRAMBLE_MULT) ^ XOR_MASK) >>> 0
  const checksum = (Math.imul(uintId ^ CHECKSUM_XOR, CHECKSUM_MULT) >>> 16) & 0xffff
  const combined = scrambled * 65536 + checksum
  const code = combined.toString(36).toUpperCase().padStart(10, '0')
  return `PRJ_${code}`
}

export function decodeProjectId(token: string): number | null {
  if (!token) return null
  const trimmed = token.trim()
  if (/^\d+$/.test(trimmed)) {
    const rawNum = Number(trimmed)
    return rawNum > 0 ? rawNum : null
  }
  const cleanToken = trimmed.startsWith('PRJ_') ? trimmed.slice(4) : trimmed
  if (!/^[0-9A-Za-z]+$/.test(cleanToken)) return null
  const combined = parseInt(cleanToken, 36)
  if (isNaN(combined) || combined <= 0) return null
  const scrambled = Math.floor(combined / 65536) >>> 0
  const checksum = (combined % 65536) & 0xffff
  const uintId = Math.imul((scrambled ^ XOR_MASK) >>> 0, UNSCRAMBLE_MULT) >>> 0
  const expectedChecksum = (Math.imul(uintId ^ CHECKSUM_XOR, CHECKSUM_MULT) >>> 16) & 0xffff
  if (checksum !== expectedChecksum || uintId <= 0) return null
  return uintId
}
