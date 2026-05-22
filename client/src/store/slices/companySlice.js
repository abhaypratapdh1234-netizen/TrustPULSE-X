import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchTrending = createAsyncThunk('companies/fetchTrending', async () => {
  const { data } = await api.get('/companies/trending')
  return data.data
})

export const fetchTopRated = createAsyncThunk('companies/fetchTopRated', async () => {
  const { data } = await api.get('/companies/top-rated')
  return data.data
})

export const fetchLowestRated = createAsyncThunk('companies/fetchLowestRated', async () => {
  const { data } = await api.get('/companies/lowest-rated')
  return data.data
})

export const searchCompanies = createAsyncThunk('companies/search', async (params) => {
  const query = new URLSearchParams(params).toString()
  const { data } = await api.get(`/companies/search?${query}`)
  return data
})

const companySlice = createSlice({
  name: 'companies',
  initialState: {
    trending: [],
    topRated: [],
    lowestRated: [],
    searchResults: [],
    searchPagination: null,
    current: null,
    loading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => { state.searchResults = []; state.searchPagination = null },
    setCurrentCompany: (state, action) => { state.current = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrending.fulfilled, (state, action) => { state.trending = action.payload })
      .addCase(fetchTopRated.fulfilled, (state, action) => { state.topRated = action.payload })
      .addCase(fetchLowestRated.fulfilled, (state, action) => { state.lowestRated = action.payload })
      .addCase(searchCompanies.pending, (state) => { state.searchLoading = true })
      .addCase(searchCompanies.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload.data
        state.searchPagination = action.payload.pagination
      })
      .addCase(searchCompanies.rejected, (state) => { state.searchLoading = false })
  },
})

export const { clearSearch, setCurrentCompany } = companySlice.actions
export default companySlice.reducer
