import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  Users, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard,
  Settings,
  Link as LinkIcon,
  FileText,
  Calendar,
  Database,
  UploadCloud
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import './styles.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/classes', icon: <Users size={20} />, label: 'Turmas' },
    { to: '/admin/users', icon: <GraduationCap size={20} />, label: 'Usuários' },
    { to: '/admin/subjects', icon: <BookOpen size={20} />, label: 'Disciplinas' },
    { to: '/admin/grades', icon: <FileText size={20} />, label: 'Análise de Notas' },
    { to: '/admin/calendar', icon: <Calendar size={20} />, label: 'Calendário' },
    { to: '/admin/import', icon: <UploadCloud size={20} />, label: 'Importar CSV' },
    { to: '/admin/audit', icon: <Database size={20} />, label: 'Auditoria' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: <LayoutDashboard size={20} />, label: 'Minhas Turmas' },
  ];

  const links = user?.role === 'Administrador' ? adminLinks : teacherLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.png" alt="Polari" style={{ width: '28px', height: '28px' }} />
            <h2 style={{ margin: 0 }}>Polari</h2>
          </div>
          <ThemeToggle />
        </div>
        <span className="role-badge">{user?.role === 'Administrador' ? 'Administrador' : 'Professor'}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/teacher'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.nome?.charAt(0)}</div>
          <div className="user-details">
            <span className="user-name">{user?.nome}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
