
import { Routes, Route } from 'react-router-dom';

import OpeningPage from './pages/OpeningPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<OpeningPage />} />
    </Routes>
  );
}

export default App;
