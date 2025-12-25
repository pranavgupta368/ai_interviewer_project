import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CandidateFlow from './pages/CandidateFlow';
import Dashboard from './pages/Dashboard';
import RecruiterJobPage from './pages/RecruiterJobPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/start" element={<CandidateFlow />} />
                <Route path="/interview/:jobId" element={<CandidateFlow />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recruiter" element={<RecruiterJobPage />} />
            </Routes>
        </Router>
    );
}

export default App;
