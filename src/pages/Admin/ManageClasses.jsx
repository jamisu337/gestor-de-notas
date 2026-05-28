import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import Modal from '../../components/Modal';
import { db } from '../../services/mockDb';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    setClasses([...db.classes]);
  };

  const handleOpenModal = (cls = null) => {
    setCurrentClass(cls || { nome: '', ano: new Date().getFullYear() });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentClass.id) {
      const idx = db.classes.findIndex(c => c.id === currentClass.id);
      db.classes[idx] = currentClass;
    } else {
      currentClass.id = 'c' + Date.now();
      db.classes.push(currentClass);
    }
    db.save('classes');
    loadClasses();
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Tem certeza que deseja excluir esta turma?')) {
      db.classes = db.classes.filter(c => c.id !== id);
      db.save('classes');
      loadClasses();
    }
  };

  const columns = [
    { field: 'nome', header: 'Nome da Turma' },
    { field: 'ano', header: 'Ano Letivo' },
  ];

  return (
    <div>
      <Card 
        title="Gestão de Turmas" 
        action={
          <button className="btn-primary" style={{ padding: '8px 16px', margin: 0 }} onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Nova Turma
          </button>
        }
      >
        <DataGrid 
          columns={columns} 
          data={classes} 
          renderActions={(row) => (
            <>
              <button className="action-btn edit" onClick={() => handleOpenModal(row)}><Edit2 size={16} /></button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></button>
            </>
          )}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentClass?.id ? 'Editar Turma' : 'Nova Turma'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome da Turma</label>
            <input 
              required
              type="text" 
              value={currentClass?.nome || ''} 
              onChange={e => setCurrentClass({...currentClass, nome: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Ano Letivo</label>
            <input 
              required
              type="number" 
              value={currentClass?.ano || ''} 
              onChange={e => setCurrentClass({...currentClass, ano: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
