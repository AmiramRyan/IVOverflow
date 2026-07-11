import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootState } from './app/store';
import { logOut } from './features/auth/authSlice';
import Login from './pages/Login';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';

function App() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [, setRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    dispatch(logOut());
  };

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ):(
          <>
            <Route path="/" element={<Questions onLogout={handleLogout} />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;