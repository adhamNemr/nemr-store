"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.token, response.data.user);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual"></div>
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <Link href="/" style={{ marginBottom: '40px', display: 'block', fontWeight: 800, fontSize: '24px', color: '#000', textDecoration: 'none' }}>NEMR</Link>
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        {error && <div className="alert alert-danger mb-4" style={{ borderRadius: '0' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ padding: '15px', borderRadius: '0', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group mb-4">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ padding: '15px', borderRadius: '0', border: '1px solid #ddd' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-dark w-100 py-3 fw-bold letter-spacing-1" 
            disabled={loading}
            style={{ borderRadius: '0' }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="helper-links mt-4 d-flex justify-content-between small">
          <a href="#" className="text-muted text-decoration-none">Forgot Password?</a>
          <span className="text-muted">New here? <Link href="/register" className="text-dark fw-bold text-decoration-none">Create Account</Link></span>
        </div>
      </div>
    </div>
  );
}
