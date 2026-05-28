import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import Modal from '../../components/Modal';
import { db } from '../../services/mockDb';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    setSubjects([...db.subjects]);
  };

  const handleOpenModal = (sub = null) => {
    setCurrentSubject(sub || { nome: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentSubject.id) {
      const idx = db.subjects.findIndex(s => s.id === currentSubject.id);
      db.subjects[idx] = currentSubject;
    } else {
      currentSubject.id = 'sub' + Date.now();
      db.subjects.push(currentSubject);
    }
    db.save('subjects');
    loadSubjects();
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      db.subjects = db.subjects.filter(s => s.id !== id);
      db.save('subjects');
      loadSubjects();
    }
  };

  const columns = [
    { field: 'nome', header: 'Disciplina' }
  ];

  return (
    <div>
      <Card 
        title="Gestão de Disciplinas" 
        action={
          <button className="btn-primary" style={{ padding: '8px 16px', margin: 0 }} onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Nova Disciplina
          </button>
        }
      >
        <DataGrid 
          columns={columns} 
          data={subjects} 
          renderActions={(row) => (
            <>
              <button className="action-btn edit" onClick={() => handleOpenModal(row)}><Edit2 size={16} /></button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></button>
            </>
          )}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSubject?.id ? 'Editar Disciplina' : 'Nova Disciplina'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome da Disciplina</label>
            <input 
              required
              type="text" 
              value={currentSubject?.nome || ''} 
              onChange={e => setCurrentSubject({...currentSubject, nome: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
