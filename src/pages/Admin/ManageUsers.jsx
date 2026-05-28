import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import Modal from '../../components/Modal';
import { db } from '../../services/mockDb';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('STAFF'); // STAFF ou STUDENTS
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers([...db.users]);
    setStudents([...db.students]);
  };

  const handleOpenModal = (user = null) => {
    if (activeTab === 'STAFF') {
      setCurrentUser(user || { nome: '', email: '', password: '123', role: 'TEACHER' });
    } else {
      setCurrentUser(user || { nome: '', matricula: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (activeTab === 'STAFF') {
      if (currentUser.id) {
        const idx = db.users.findIndex(u => u.id === currentUser.id);
        db.users[idx] = currentUser;
      } else {
        currentUser.id = 'u' + Date.now();
        db.users.push(currentUser);
      }
      db.save('users');
    } else {
      if (currentUser.id) {
        const idx = db.students.findIndex(s => s.id === currentUser.id);
        db.students[idx] = currentUser;
      } else {
        currentUser.id = 's' + Date.now();
        db.students.push(currentUser);
      }
      db.save('students');
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Tem certeza que deseja excluir?')) {
      if (activeTab === 'STAFF') {
        db.users = db.users.filter(u => u.id !== id);
        db.save('users');
      } else {
        db.students = db.students.filter(s => s.id !== id);
        db.save('students');
      }
      loadData();
    }
  };

  const staffColumns = [
    { field: 'nome', header: 'Nome' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Cargo' },
  ];

  const studentColumns = [
    { field: 'nome', header: 'Nome' },
    { field: 'matricula', header: 'Matrícula' },
  ];

  return (
    <div>
      <Card title="Gestão de Usuários">
        
        <div className="role-selector" style={{ maxWidth: '400px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={`role-tab ${activeTab === 'STAFF' ? 'active' : ''}`}
            onClick={() => setActiveTab('STAFF')}
          >
            Professores / Admins
          </button>
          <button 
            type="button" 
            className={`role-tab ${activeTab === 'STUDENTS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STUDENTS')}
          >
            Alunos
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button className="btn-primary" style={{ padding: '8px 16px', width: 'auto' }} onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Adicionar {activeTab === 'STAFF' ? 'Staff' : 'Aluno'}
          </button>
        </div>

        <DataGrid 
          columns={activeTab === 'STAFF' ? staffColumns : studentColumns} 
          data={activeTab === 'STAFF' ? users : students} 
          renderActions={(row) => (
            <>
              <button className="action-btn edit" onClick={() => handleOpenModal(row)}><Edit2 size={16} /></button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></button>
            </>
          )}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser?.id ? 'Editar' : 'Adicionar'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome</label>
            <input required type="text" value={currentUser?.nome || ''} onChange={e => setCurrentUser({...currentUser, nome: e.target.value})} />
          </div>
          
          {activeTab === 'STAFF' ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={currentUser?.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Cargo</label>
                <select 
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  value={currentUser?.role || 'TEACHER'} 
                  onChange={e => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value="TEACHER">Professor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Matrícula</label>
              <input required type="text" value={currentUser?.matricula || ''} onChange={e => setCurrentUser({...currentUser, matricula: e.target.value})} />
            </div>
          )}
          
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
