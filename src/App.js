import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Floating = lazy(() => import('@/containers/Floating/index'));


function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<div className='loading_page'>Loading...</div>}>
        <Routes>
          <Route element={ <Floating /> } path="/" />
        </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
