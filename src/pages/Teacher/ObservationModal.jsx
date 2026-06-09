import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { api, db } from '../../services/mockDb';
import { useToast } from '../../contexts/ToastContext';

export default function ObservationModal({ isOpen, onClose, student, classSubjectId, bimestre }) {
  const [text, setText] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && student) {
      // Load existing observation if any
      const obs = db.observations.find(o => 
        o.student_id === student.id && 
        o.class_subject_id === classSubjectId && 
        o.bimestre === bimestre
      );
      setText(obs ? obs.text : '');
    }
  }, [isOpen, student, classSubjectId, bimestre]);

  const handleSave = async () => {
    try {
      await api.saveObservation(student.id, classSubjectId, bimestre, text);
      addToast('Observação salva com sucesso', 'success');
      onClose();
    } catch (err) {
      addToast('Erro ao salvar observação', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Observações - ${student?.nome}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, color: 'var(--text-light)' }}>
          Bimestre: {bimestre}º
        </p>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva notas de acompanhamento qualitativo aqui..."
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '4px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Salvar Observação
          </button>
        </div>
      </div>
    </Modal>
  );
}
