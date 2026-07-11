import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useLazyGetUserInfoQuery } from '../features/api/apiSlice';
import { setCredentials } from '../features/auth/authSlice';
import styles from '../css/Login.module.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState('');

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [triggerGetUserInfo] = useLazyGetUserInfoQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!email || !password) {
      setCustomError('Please fill in all fields.');
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      const userResult = await triggerGetUserInfo(response.token).unwrap();

      dispatch(setCredentials({ token: response.token, user: userResult }));
      onLoginSuccess();
    } catch (err: any) {
      setCustomError(err?.data?.error || 'Invalid email or password.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Logo Icon Layer */}
        <div className={styles.logo}>
          IV
        </div>

        {/* Headline Element */}
        <h1 className={styles.title}>
          IVOverflow
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {customError && (
            <div className={styles.error}>
              {customError}
            </div>
          )}

          {/* Email input component */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="amiram@ivtech.com"
              disabled={isLoading}
            />
          </div>

          {/* Password input component */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit element */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Connecting...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}