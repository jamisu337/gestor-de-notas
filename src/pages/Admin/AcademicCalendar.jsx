import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import { db, api } from '../../services/mockDb';
import { useToast } from '../../contexts/ToastContext';
import Loader from '../../components/Loader';
import { Lock, Unlock } from 'lucide-react';

export default function AcademicCalendar() {
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setCalendar(db.academicCalendar);
  }, []);

  const handleDateChange = async (id, field, value) => {
    try {
      await api.updateCalendar(id, { [field]: value });
      setCalendar([...db.academicCalendar]);
      addToast('Data atualizada com sucesso', 'success');
    } catch (err) {
      addToast('Erro ao atualizar data', 'error');
    }
  };

  const toggleLock = async (id, currentLockedStatus) => {
    setLoading(true);
    try {
      await api.updateCalendar(id, { is_locked: !currentLockedStatus });
      setCalendar(db.academicCalendar);
      addToast(`Bimestre ${!currentLockedStatus ? 'bloqueado' : 'desbloqueado'} com sucesso!`, 'success');
    } catch (err) {
      addToast('Erro ao atualizar calendário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'bimestre', header: 'Bimestre', render: (row) => `${row.bimestre}º Bimestre` },
    { field: 'start_date', header: 'Data de Início', render: (row) => (
      <input 
        type="date" 
        value={row.start_date}
        onChange={(e) => handleDateChange(row.id, 'start_date', e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
      />
    )},
    { field: 'end_date', header: 'Data de Término', render: (row) => (
      <input 
        type="date" 
        value={row.end_date}
        onChange={(e) => handleDateChange(row.id, 'end_date', e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
      />
    )},
    { field: 'is_locked', header: 'Status', render: (row) => {
      const isAutoClosed = new Date() > new Date(row.end_date + 'T23:59:59');
      const isClosed = row.is_locked || isAutoClosed;
      return (
        <span style={{ color: isClosed ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
          {isClosed ? (row.is_locked ? 'Fechado (Manual)' : 'Fechado (Prazo)') : 'Aberto'}
        </span>
      );
    }},
    { field: 'actions', header: 'Ações', render: (row) => (
      <button 
        onClick={() => toggleLock(row.id, row.is_locked)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: row.is_locked ? '#10b981' : '#ef4444',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        {row.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
        {row.is_locked ? 'Desbloquear' : 'Bloquear'}
      </button>
    )}
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Calendário Acadêmico</h1>
      <Card title="Controle de Prazos (Bloqueio de Notas)">
        <DataGrid data={calendar} columns={columns} />
        {loading && <Loader fullScreen />}
      </Card>
    </div>
  );
}
