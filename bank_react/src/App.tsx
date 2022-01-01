import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import MainPage from './components/MainPage';
import AuthorizationPage from './components/AuthorizationPage';
import PaymentPage from './components/PaymentPage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage/>} />
          <Route path='/authorization' element={<AuthorizationPage/>} />
          <Route path='/transaction' element={<PaymentPage/>} />
          <Route path='/register' element={<RegisterPage/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
