import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'User not authorized') {
        toast.error('You are not authorized to access this system');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later');
      } else {
        toast.error('Failed to login. Please try again');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 55%, var(--blue-light) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Blueprint grid overlay */}
      <div style={{
        position: 'absolute', 
        inset: 0, 
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Radial glows */}
      <div style={{ 
        position: 'absolute', 
        top: '-20%', 
        right: '5%', 
        width: 500, 
        height: 500, 
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)', 
        pointerEvents: 'none' 
      }} />
      <div style={{ 
        position: 'absolute', 
        bottom: '-30%', 
        left: '0%', 
        width: 400, 
        height: 400, 
        background: 'radial-gradient(circle, rgba(0,58,112,0.4) 0%, transparent 65%)', 
        pointerEvents: 'none' 
      }} />

      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: 440,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Top gradient bar */}
        <div style={{
          height: 5,
          background: 'linear-gradient(90deg, var(--blue-dark), var(--blue), var(--blue-light))'
        }} />

        <div style={{ padding: '48px 40px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img 
              src="/andritz-logo.svg" 
              alt="ANDRITZ" 
              style={{ height: 32, marginBottom: 24 }} 
            />
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--blue-dark)',
              letterSpacing: 1,
              marginBottom: 8
            }}>
              Condition Monitoring Portal
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text-muted)'
            }}>
              Sign in to access the system
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--blue-dark)',
                marginBottom: 8
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  border: '1.5px solid rgba(0,117,190,0.2)',
                  borderRadius: 6,
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: '#fff'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0,117,190,0.2)'}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--blue-dark)',
                marginBottom: 8
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  border: '1.5px solid rgba(0,117,190,0.2)',
                  borderRadius: 6,
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: '#fff'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0,117,190,0.2)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: '#fff',
                background: loading ? 'var(--text-muted)' : 'var(--blue)',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = 'var(--blue-dark)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = 'var(--blue)';
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Status indicator */}
          <div style={{ 
            marginTop: 32, 
            paddingTop: 24, 
            borderTop: '1px solid rgba(0,117,190,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: 'var(--green)', 
              animation: 'pulse-glow 2s infinite' 
            }} />
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 10, 
              color: 'var(--text-muted)', 
              letterSpacing: 2 
            }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
