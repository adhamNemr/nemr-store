"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data.success) {
        // Redirect to login after successful registration
        router.push('/login?registered=true');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual" style={{ backgroundColor: '#111' }}></div>
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <Link href="/" style={{ marginBottom: '40px', display: 'block', fontWeight: 800, fontSize: '24px', color: '#000', textDecoration: 'none' }}>NEMR</Link>
          <h2>Create Account</h2>
          <p>Join the NEMR community.</p>
        </div>

        {error && <div className="alert alert-danger mb-4" style={{ borderRadius: '0' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Full Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={{ padding: '15px', borderRadius: '0', border: '1px solid #ddd' }}
            />
          </div>
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
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="helper-links mt-4 d-flex justify-content-center small">
          <span className="text-muted">Already have an account? <Link href="/login" className="text-dark fw-bold text-decoration-none">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
