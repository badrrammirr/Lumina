import axios from 'axios'

const BASE = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
})

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