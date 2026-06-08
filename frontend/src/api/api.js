import axios from 'axios'

const BASE = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Authentication
export async function register(username, password, email = null) {
  const res = await api.post('/register', { username, password, email })
  if (res.data.access_token) {
    localStorage.setItem('access_token', res.data.access_token)
  }
  return res.data
}

export async function login(username, password) {
  const res = await api.post('/login', { username, password })
  if (res.data.access_token) {
    localStorage.setItem('access_token', res.data.access_token)
  }
  return res.data
}

export async function logout() {
  localStorage.removeItem('access_token')
  const res = await api.post('/logout')
  return res.data
}

export async function getMe() {
  const res = await api.get('/me')
  return res.data
}

// Chat History
export async function getChats() {
  const res = await api.get('/chats')
  return res.data
}

export async function createChat(title) {
  const res = await api.post('/chats', { title })
  return res.data
}

export async function getChat(chatId) {
  const res = await api.get(`/chats/${chatId}`)
  return res.data
}

export async function addChatMessage(chatId, content, role) {
  const res = await api.post(`/chats/${chatId}/messages`, { content, role })
  return res.data
}

export async function deleteChat(chatId) {
  const res = await api.delete(`/chats/${chatId}`)
  return res.data
}

export async function renameChat(chatId, title) {
  const res = await api.patch(`/chats/${chatId}`, { title })
  return res.data
}

// Original endpoints
export async function askQuestion(question, k = 3, source = null) {
  const params = { question, k }
  if (source) params.source = source
  const res = await api.post('/ask', null, { params })
  return res.data
}

export async function uploadPDF(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload_pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return res.data
}

export async function analyzeResults(results) {
  const res = await api.post('/analyze_results', results)
  return res.data
}

export async function generateAdaptiveQuiz(weakChunks) {
  const res = await api.post('/generate_adaptive_quiz', weakChunks)
  return res.data
}

export async function fetchPDFs() {
  const res = await api.get('/pdfs')
  return res.data
}

export async function fetchStatus() {
  const res = await api.get('/status')
  return res.data
}

export async function deletePDF(filename) {
  const res = await api.delete(`/pdf/${encodeURIComponent(filename)}`)
  return res.data
}

export async function generateQuiz(topic, source = null, numQuestions = 5) {
  const res = await api.post('/generate_quiz', {
    topic: topic,
    source: source,
    num_questions: numQuestions
  })
  return res.data
}

export async function generateSummary(source = null, length = 3) {
  const res = await api.post('/generate_summary', {
    source: source,
    length: length
  })
  return res.data
}

export async function generateFlashcards(source = null, numCards = 10) {
  const res = await api.post('/generate_flashcards', {
    source: source,
    num_cards: numCards
  })
  return res.data
}
