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
  const [searchTerm, setSearchTerm] = useState('');
  
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
      setCurrentUser(user || { nome: '', email: '', password: '123', role: 'Professor' });
    } else {
      let newMatricula = '';
      if (!user) {
        const maxMatricula = db.students.reduce((max, s) => {
          const num = parseInt(s.matricula, 10);
          return !isNaN(num) && num > max ? num : max;
        }, 2026000);
        newMatricula = (maxMatricula + 1).toString();
      }
      setCurrentUser(user || { nome: '', matricula: newMatricula, email: '', telefone: '' });
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
      const isDuplicate = db.students.some(s => s.matricula === currentUser.matricula && s.id !== currentUser.id);
      if (isDuplicate) {
        alert('Já existe um aluno com essa matrícula. Por favor, insira uma matrícula única.');
        return;
      }

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
    { field: 'email', header: 'Email' },
    { field: 'telefone', header: 'Telefone' },
  ];

  const filteredUsers = users.filter(u => u.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredStudents = students.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));

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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, maxWidth: '300px' }}>
            <input 
              type="text" 
              placeholder="Pesquisar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
            />
          </div>
          <button className="btn-primary" style={{ padding: '8px 16px', width: 'auto', margin: 0 }} onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Adicionar {activeTab === 'STAFF' ? 'Funcionário' : 'Aluno'}
          </button>
        </div>

        <DataGrid 
          columns={activeTab === 'STAFF' ? staffColumns : studentColumns} 
          data={activeTab === 'STAFF' ? filteredUsers : filteredStudents} 
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
                  value={currentUser?.role || 'Professor'} 
                  onChange={e => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value="Professor">Professor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Matrícula</label>
                <input required type="text" value={currentUser?.matricula || ''} onChange={e => setCurrentUser({...currentUser, matricula: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email (Opcional)</label>
                <input type="email" value={currentUser?.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Telefone do Responsável (Opcional)</label>
                <input type="tel" value={currentUser?.telefone || ''} onChange={e => setCurrentUser({...currentUser, telefone: e.target.value})} />
              </div>
            </>
          )}
          
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
