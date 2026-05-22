import { createSlice } from '@reduxjs/toolkit'

const THEMES = ['dark', 'light', 'cyberpunk', 'midnight', 'purple', 'minimal']

const getSavedTheme = () => {
  const saved = localStorage.getItem('trustpulse-theme')
  return THEMES.includes(saved) ? saved : 'dark'
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('trustpulse-theme', theme)
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    current: getSavedTheme(),
    themes: THEMES,
  },
  reducers: {
    setTheme: (state, action) => {
      if (THEMES.includes(action.payload)) {
        state.current = action.payload
        applyTheme(action.payload)
      }
    },
    cycleTheme: (state) => {
      const idx = THEMES.indexOf(state.current)
      const next = THEMES[(idx + 1) % THEMES.length]
      state.current = next
      applyTheme(next)
    },
  },
})

export const { setTheme, cycleTheme } = themeSlice.actions
export default themeSlice.reducer
