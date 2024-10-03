import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Comic = lazy(() => import('@/containers/Comic/index'));
const Floating = lazy(() => import('@/containers/Floating/index'));
const Scroll = lazy(() => import('@/containers/Scroll/index'));


function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<div className='loading_page'>Loading...</div>}>
        <Routes>
          <Route element={ <Comic /> } path="/" />
          <Route element={ <Floating /> } path="/floating" />
          <Route element={ <Scroll /> } path="/scroll" />
        </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
