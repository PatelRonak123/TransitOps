import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './features/dashboard/pages/Dashboard'

function App() {
    // Define routing here
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
