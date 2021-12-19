import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import MainPage from './components/MainPage';
import AuthorizationPage from './components/AuthorizationPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage/>} />
          <Route path='/authorization/:email' element={<AuthorizationPage/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
