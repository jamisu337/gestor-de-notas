import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

export default function Login() {
  const [role, setRole] = useState('TEACHER'); // TEACHER ou ADMIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate(role === 'ADMIN' ? '/admin' : '/teacher');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Gestor Escolar</h1>
          <p>Acesse sua conta para continuar</p>
        </div>

        <div className="role-selector">
          <button 
            type="button" 
            className={`role-tab ${role === 'TEACHER' ? 'active' : ''}`}
            onClick={() => setRole('TEACHER')}
          >
            Sou Professor
          </button>
          <button 
            type="button" 
            className={`role-tab ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRole('ADMIN')}
          >
            Sou Administrador
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder={role === 'ADMIN' ? 'admin@escola.com' : 'professor@escola.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="Sua senha (123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
