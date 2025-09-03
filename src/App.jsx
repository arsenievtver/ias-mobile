// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProvider from './context/UserProvider.jsx';
import Terminal from './pages/terminal.jsx';
import Lk from './pages/lk.jsx';
import Instruction from './pages/instruction.jsx';
import Education from './pages/education.jsx';
import Test from './pages/test.jsx';

function App() {
    return (
        <Router>
            <UserProvider>
                <Routes>
                    <Route path="/" element={<Terminal />} />
                    <Route path="/lk" element={<Lk />} />
                    <Route path="/instruction" element={<Instruction />} />
                    <Route path="/education" element={<Education />} />
                    <Route path="/test" element={<Test />} />
                </Routes>
            </UserProvider>
        </Router>
    );
}

export default App;
