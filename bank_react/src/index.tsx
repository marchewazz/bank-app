import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App';
import reportWebVitals from './reportWebVitals';

import MainPage from './components/MainPage';
import AuthorizationPage from './components/AuthorizationPage';
import PaymentPage from './components/PaymentPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App/>} >
        <Route path='' element={<MainPage/>} />
        <Route path='authorization' element={<AuthorizationPage/>} />
        <Route path='transaction' element={<PaymentPage/>} />
        <Route path='register' element={<RegisterPage/>} />
        <Route path='login' element={<LoginPage/>} />
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
