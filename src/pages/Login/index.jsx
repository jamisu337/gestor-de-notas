import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './styles.css';

export default function Login() {
  const [role, setRole] = useState('Professor'); // Professor ou Administrador
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const res = await login(email, password, role);
    if (res.success) {
      navigate(role === 'Administrador' ? '/admin' : '/teacher');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="Polari" className="login-logo light-logo" />
          <img src="/logo dark.png" alt="Polari" className="login-logo dark-logo" />
        </div>

        <div className="role-selector">
          <button 
            type="button" 
            className={`role-tab ${role === 'Professor' ? 'active' : ''}`}
            onClick={() => setRole('Professor')}
          >
            <User size={18} />
            Professor
          </button>
          <button 
            type="button" 
            className={`role-tab ${role === 'Administrador' ? 'active' : ''}`}
            onClick={() => setRole('Administrador')}
          >
            <ShieldCheck size={18} />
            Administrador
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder={role === 'Administrador' ? 'admin@escola.com' : 'professor@escola.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="btn-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </label>
            <a href="#" className="forgot-password">Esqueci minha senha</a>
          </div>

          <button type="submit" className="btn-login">
            Entrar na Plataforma
          </button>
        </form>
      </div>
    </div>
  );
}
