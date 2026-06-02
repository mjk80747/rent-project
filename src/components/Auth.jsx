import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dynamic API URL based on environment
  const getAPIURL = () => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isDev ? 'http://localhost:5000' : '';
    return `${API_BASE_URL}/api/auth`;
  };

  const API_URL = getAPIURL();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ name, email, phone, password, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Signup failed');
        return;
      }

      toast.success('Account created successfully! Logging you in...');
      onLoginSuccess({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Login failed');
        return;
      }

      toast.success('Login successful!');
      onLoginSuccess({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      });

      // Reset form
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="auth-form">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Login to your PG Account</p>
      
      <div className="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          placeholder="your.email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', paddingRight: '40px' }}
          />
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <button type="submit" className="btn-primary w-100 mb-3" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <div className="auth-links">
        <button type="button" className="link-btn" onClick={() => setView('forgot')} disabled={loading}>Forgot Password?</button>
        <p>Don't have an account? <button type="button" className="link-btn highlight" onClick={() => { setView('signup'); setEmail(''); setPassword(''); }} disabled={loading}>Sign Up</button></p>
      </div>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignup} className="auth-form">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join PG Management Systems</p>
      
      <div className="form-group">
        <label>Full Name</label>
        <input 
          type="text" 
          placeholder="John Doe" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          placeholder="john@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <div className="phone-input-group">
          <span className="country-code">+91</span>
          <input 
            type="tel" 
            placeholder="10-digit number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Create a password (min 6 characters)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={loading}
            style={{ width: '100%', paddingRight: '40px' }}
          />
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Confirm your password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            disabled={loading}
            style={{ width: '100%', paddingRight: '40px' }}
          />
        </div>
      </div>
      
      <button type="submit" className="btn-primary w-100 mb-3" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
      
      <div className="auth-links">
        <p>Already have an account? <button type="button" className="link-btn highlight" onClick={() => { setView('login'); setEmail(''); setPassword(''); }} disabled={loading}>Log In</button></p>
      </div>
    </form>
  );

  const renderForgot = () => (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Reset link sent to your email!"); setView('login'); }} className="auth-form">
      <h2>Reset Password</h2>
      <p className="auth-subtitle">We will send a reset link to your email</p>
      
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" placeholder="Enter your email" required disabled={loading} />
      </div>
      
      <button type="submit" className="btn-primary w-100 mb-3" disabled={loading}>Send Reset Link</button>
      
      <div className="auth-links">
        <button type="button" className="link-btn" onClick={() => setView('login')} disabled={loading}>← Back to Login</button>
      </div>
    </form>
  );

  return (
    <div className="auth-wrapper">
      <div className="auth-container glass-panel">
        <div className="auth-brand">
          <h1>PG Management<span className="highlight-text">Systems</span></h1>
        </div>
        
        <div className="auth-content">
          {view === 'login' && renderLogin()}
          {view === 'signup' && renderSignup()}
          {view === 'forgot' && renderForgot()}
        </div>
      </div>
    </div>
  );
};

export default Auth;
