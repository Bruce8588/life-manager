import { Routes, Route, Navigate } from 'react-router-dom'
import ReadingHome from './components/ReadingHome'
import BookNotes from './components/BookNotes'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReadingHome />} />
      <Route path="/book/:bookId" element={<BookNotes />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
