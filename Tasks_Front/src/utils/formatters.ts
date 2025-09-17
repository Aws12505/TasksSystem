// Helper utilities for safe number formatting
export const safeToFixed = (value: unknown, decimals: number = 1): string => {
  if (value == null) return '0'
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num.toFixed(decimals) : '0'
}

export const formatAvg = (v: unknown): string | null => {
  // Handle null/undefined cases first
  if (v == null) return null
  
  // If it's already a number, use it directly
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v.toFixed(1) : null
  }
  
  // Convert string to number
  const n = Number.parseFloat(String(v).trim())
  return Number.isFinite(n) ? n.toFixed(1) : null
}

export const formatDate = (d: string | number | Date): string =>
  new Date(d).toLocaleDateString()
