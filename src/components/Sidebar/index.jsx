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
  Link as LinkIcon
} from 'lucide-react';
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
    { to: '/admin/allocations', icon: <LinkIcon size={20} />, label: 'Alocações' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: <LayoutDashboard size={20} />, label: 'Minhas Turmas' },
  ];

  const links = user?.role === 'Administrador' ? adminLinks : teacherLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Gestor Escolar</h2>
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
