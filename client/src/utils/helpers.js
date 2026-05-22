// Format numbers
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString() || '0'
}

// Format rating to 1 decimal
export const formatRating = (rating) => {
  const num = parseFloat(rating) || 0
  return num.toFixed(1)
}

// Get rating color class
export const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-emerald-400'
  if (rating >= 3) return 'text-amber-400'
  if (rating >= 2) return 'text-orange-400'
  return 'text-rose-400'
}

// Get trust score color
export const getTrustColor = (score) => {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  if (score >= 25) return '#f97316'
  return '#f43f5e'
}

// Get sentiment color
export const getSentimentColor = (sentiment) => {
  const map = { positive: '#10b981', negative: '#f43f5e', neutral: '#94a3b8' }
  return map[sentiment] || '#94a3b8'
}

// Get industry icon
export const getIndustryIcon = (industry) => {
  const icons = {
    IT: '💻', Finance: '💰', Healthcare: '🏥', Startup: '🚀',
    Product: '📦', Service: '🛠️', Remote: '🌐',
    Manufacturing: '🏭', Retail: '🛒', Education: '📚', Other: '🏢',
  }
  return icons[industry] || '🏢'
}

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

// Relative time
export const timeAgo = (date) => {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

// Generate avatar initials color
export const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6']
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

// Get initials
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Sleep utility
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Debounce
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Format percentage
export const formatPercent = (value) => `${parseFloat(value || 0).toFixed(1)}%`

// Get trend icon
export const getTrendIcon = (direction) => {
  if (direction === 'up') return '↑'
  if (direction === 'down') return '↓'
  return '→'
}

export const getTrendColor = (direction) => {
  if (direction === 'up') return 'text-emerald-400'
  if (direction === 'down') return 'text-rose-400'
  return 'text-amber-400'
}
