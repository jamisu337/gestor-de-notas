import React, { useState, useEffect, useMemo } from 'react';
import { db, api } from '../../services/mockDb';
import { useToast } from '../../contexts/ToastContext';
import { Save, AlertCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Card from '../../components/Card';
import './styles.css';

// Utilitários para gerar datas
const getWeekDays = (baseDate) => {
  const dates = [];
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // ajusta quando é domingo
  start.setDate(diff);

  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const getMonthDays = (baseDate) => {
  const dates = [];
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Ignora Sábado e Domingo
      dates.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

export default function AttendanceTab({ classSubjectId, students, isBimestreClosed }) {
  const { addToast } = useToast();
  
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [baseDate, setBaseDate] = useState(new Date());
  
  const [attendanceData, setAttendanceData] = useState({}); // { "studentId_date": "presente" }
  const [drafts, setDrafts] = useState({}); // Mudanças não salvas
  const [savingStatus, setSavingStatus] = useState(false);

  const firstBimestreStartDate = useMemo(() => {
    return db.academicCalendar.find(c => c.bimestre === 1)?.start_date || '2026-02-01';
  }, []);

  // Derivar datas a serem exibidas na grade
  const datesToShow = useMemo(() => {
    if (viewMode === 'day') {
      // Se cair no fds, não há problema, mas o ideal seria voltar pra sexta
      return [baseDate];
    } else if (viewMode === 'week') {
      return getWeekDays(baseDate);
    } else {
      return getMonthDays(baseDate);
    }
  }, [viewMode, baseDate]);

  const dateStrings = useMemo(() => datesToShow.map(d => d.toISOString().split('T')[0]), [datesToShow]);

  useEffect(() => {
    // Buscar frequências do banco apenas para as datas visíveis
    const loadedData = {};
    students.forEach(s => {
      dateStrings.forEach(ds => {
        const record = db.attendance.find(a => a.student_id === s.id && a.class_subject_id === classSubjectId && a.date === ds);
        if (record) {
          loadedData[`${s.id}_${ds}`] = record.status;
        }
      });
    });
    setAttendanceData(loadedData);
    setDrafts({});
  }, [classSubjectId, students, dateStrings]);

  const handleNext = () => {
    const newDate = new Date(baseDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setBaseDate(newDate);
  };

  const handlePrev = () => {
    const newDate = new Date(baseDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setBaseDate(newDate);
  };

  const handleStatusToggle = (studentId, dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isPastOrToday = dateStr <= todayStr && dateStr >= firstBimestreStartDate;

    const key = `${studentId}_${dateStr}`;
    const dbStatus = attendanceData[key];
    const baseStatus = dbStatus || (isPastOrToday ? 'presente' : '');
    
    const currentStatus = drafts[key] !== undefined ? drafts[key] : baseStatus;
    
    let nextStatus = currentStatus === 'presente' ? 'falta' : 'presente';

    setDrafts(prev => ({ ...prev, [key]: nextStatus }));
  };

  const handleSave = async () => {
    const keys = Object.keys(drafts);
    if (keys.length === 0) return;

    setSavingStatus(true);
    try {
      const records = keys.map(k => {
        const [student_id, date] = k.split('_');
        return {
          student_id,
          class_subject_id: classSubjectId,
          date,
          status: drafts[k]
        };
      });

      await api.bulkSaveAttendance(records);
      
      // Merge drafts in
      setAttendanceData(prev => ({ ...prev, ...drafts }));
      setDrafts({});
      addToast('Frequência salva com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao salvar frequência', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const formatHeader = (d) => {
    if (viewMode === 'month') return d.getDate().toString().padStart(2, '0');
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
  };

  const getStatusLabel = (status) => {
    if (status === 'presente') return 'P';
    if (status === 'falta') return 'F';
    return '-';
  };

  const getStatusStyle = (status, isDraft) => {
    const baseStyle = {
      width: '32px', height: '32px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '6px', fontWeight: 'bold', fontSize: '14px',
      cursor: 'pointer',
      userSelect: 'none',
      border: isDraft ? '2px solid var(--accent)' : '1px solid var(--border)'
    };

    if (status === 'presente') return { ...baseStyle, backgroundColor: '#10b981', color: '#fff', borderColor: isDraft ? 'var(--accent)' : '#10b981' };
    if (status === 'falta') return { ...baseStyle, backgroundColor: '#ef4444', color: '#fff', borderColor: isDraft ? 'var(--accent)' : '#ef4444' };
    
    return { ...baseStyle, backgroundColor: 'var(--bg)', color: 'var(--text-light)' };
  };

  const hasDrafts = Object.keys(drafts).length > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value="day">Dia</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px', color: 'var(--text)' }}>
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontWeight: '500', padding: '0 8px', minWidth: '120px', textAlign: 'center' }}>
              {viewMode === 'month' 
                ? baseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                : `Início: ${datesToShow[0]?.toLocaleDateString('pt-BR')}`
              }
            </span>
            <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px', color: 'var(--text)' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {hasDrafts && (
          <button 
            onClick={handleSave} 
            disabled={savingStatus}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
              backgroundColor: '#10b981', 
              color: '#fff', 
              border: 'none',
              borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', transition: 'all 0.2s'
            }}
          >
            <Save size={18} />
            {savingStatus ? 'Salvando...' : 'Salvar Frequência'}
          </button>
        )}

      </div>

      {hasDrafts && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>Você possui frequências não salvas. Clique em "Salvar Frequência" para registrar. P=Presente, F=Falta.</span>
        </div>
      )}

      <Card>
        <div className="datagrid-container" style={{ overflowX: 'auto' }}>
          <table className="datagrid-table gradebook-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px', minWidth: '200px', position: 'sticky', left: 0, background: 'var(--card-bg)', zIndex: 10, borderRight: '1px solid var(--border)' }}>Aluno</th>
                {datesToShow.map((d, i) => (
                  <th key={i} style={{ padding: '12px', textAlign: 'center', minWidth: '48px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 'normal' }}>
                      {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                    </div>
                    <div>{formatHeader(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', position: 'sticky', left: 0, background: 'var(--card-bg)', zIndex: 10, borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-h)' }}>{student.nome}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Mat: {student.matricula}</div>
                  </td>
                  
                  {dateStrings.map((ds) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isPastOrToday = ds <= todayStr && ds >= firstBimestreStartDate;
                    
                    const key = `${student.id}_${ds}`;
                    const dbStatus = attendanceData[key];
                    const baseStatus = dbStatus || (isPastOrToday ? 'presente' : '');
                    
                    const isDraft = drafts[key] !== undefined;
                    const status = isDraft ? drafts[key] : baseStatus;

                    return (
                      <td key={ds} style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div 
                            style={getStatusStyle(status, isDraft)}
                            onClick={() => handleStatusToggle(student.id, ds)}
                            title={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Sem registro'}
                          >
                            {getStatusLabel(status)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={datesToShow.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                    Nenhum aluno matriculado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
