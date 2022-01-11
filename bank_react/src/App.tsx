import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';

import { refreshUserData } from './utilities';

function App() {
  
  const location = useLocation();

  useEffect(() => {
    refreshUserData();
  }, [location])
  
  return (
    <>
      <NavBar />

      <Outlet />
    </>
  );
}

export default App;
