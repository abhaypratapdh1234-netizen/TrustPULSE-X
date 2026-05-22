import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    chatbotOpen: false,
    notificationsOpen: false,
    searchOpen: false,
    modalOpen: false,
    modalContent: null,
    toast: null,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload },
    toggleChatbot: (state) => { state.chatbotOpen = !state.chatbotOpen },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen },
    openModal: (state, action) => { state.modalOpen = true; state.modalContent = action.payload },
    closeModal: (state) => { state.modalOpen = false; state.modalContent = null },
  },
})

export const { toggleSidebar, setSidebar, toggleChatbot, toggleNotifications, toggleSearch, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
