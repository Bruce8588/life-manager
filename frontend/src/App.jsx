import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import ProjectPage from './components/ProjectPage'
import FinancePage from './components/FinancePage'
import PsychologyPage from './components/PsychologyPage'
import HealthPlans from './components/HealthPlans'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/body/health-plans" element={<HealthPlans />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/psychology" element={<PsychologyPage />} />
      <Route path="/trading" element={<Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
