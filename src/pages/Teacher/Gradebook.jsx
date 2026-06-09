import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import CustomSelect from '../../components/CustomSelect';
import { db, api } from '../../services/mockDb';
import { ArrowLeft, CheckCircle, MessageSquare, Save, AlertCircle, Lock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ObservationModal from './ObservationModal';
import AttendanceTab from './AttendanceTab';
import './styles.css';

export default function Gradebook() {
  const { classSubjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [details, setDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingStatus, setSavingStatus] = useState(false);
  
  const [bimestre, setBimestre] = useState(1);
  const [formula, setFormula] = useState(null);
  const [isBimestreClosed, setIsBimestreClosed] = useState(false);
  const [activeTab, setActiveTab] = useState('notas');

  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [selectedStudentForObs, setSelectedStudentForObs] = useState(null);

  useEffect(() => {
    loadData();
    const savedDrafts = JSON.parse(localStorage.getItem(`draft_${classSubjectId}_${bimestre}`) || '{}');
    setDrafts(savedDrafts);

    const currentTerm = db.academicCalendar.find(c => c.bimestre === bimestre);
    if (currentTerm) {
      const isAutoClosed = new Date() > new Date(currentTerm.end_date + 'T23:59:59');
      setIsBimestreClosed(currentTerm.is_locked || isAutoClosed);
    } else {
      setIsBimestreClosed(false);
    }
  }, [classSubjectId, bimestre]);

  const loadData = () => {
    const cst = db.classSubjectTeacher.find(c => c.id === classSubjectId);
    if (!cst) return;

    const cls = db.classes.find(c => c.id === cst.class_id);
    const sub = db.subjects.find(s => s.id === cst.subject_id);
    
    setDetails({ className: cls?.nome, subjectName: sub?.nome });

    let form = db.gradeFormulas.find(f => f.class_subject_id === classSubjectId);
    if (!form) {
      form = { fields: [{ name: 'AV1', weight: 0.5 }, { name: 'AV2', weight: 0.5 }] };
    }
    setFormula(form);

    const stIds = db.classStudents.filter(cs => cs.class_id === cst.class_id).map(cs => cs.student_id);
    const classStudents = db.students.filter(s => stIds.includes(s.id));

    const studentsWithGrades = classStudents.map(student => {
      const grade = db.grades.find(g => g.student_id === student.id && g.class_subject_id === classSubjectId && g.bimestre === bimestre);
      const studentVals = grade?.values || {};
      
      const stObj = { ...student };
      form.fields.forEach(f => {
        stObj[f.name] = studentVals[f.name] !== undefined && studentVals[f.name] !== null ? studentVals[f.name] : '';
      });
      return stObj;
    });

    setStudents(studentsWithGrades);
  };

  const handleGradeChange = (studentId, fieldName, value) => {
    let numValue = value.replace(',', '.');
    if (numValue !== '') {
      let parsed = parseFloat(numValue);
      if (isNaN(parsed)) return;
      if (parsed < 0) numValue = '0';
      if (parsed > 10) numValue = '10';
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, [fieldName]: numValue };
      }
      return s;
    }));

    // Update Draft
    const newDrafts = { ...drafts, [`${studentId}_${fieldName}`]: numValue };
    setDrafts(newDrafts);
    localStorage.setItem(`draft_${classSubjectId}_${bimestre}`, JSON.stringify(newDrafts));
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(drafts);
    if (keys.length === 0) {
      addToast('Não há alterações para salvar.', 'info');
      return;
    }

    setSavingStatus(true);
    try {
      for (const key of keys) {
        const [studentId, fieldName] = key.split('_');
        const val = drafts[key];
        const n = val === '' ? null : parseFloat(val);
        await api.updateGrade(studentId, classSubjectId, bimestre, fieldName, n, user?.id);
      }
      setDrafts({});
      localStorage.removeItem(`draft_${classSubjectId}_${bimestre}`);
      addToast('Todas as notas foram salvas com sucesso!', 'success');
    } catch (err) {
      addToast('Erro ao salvar algumas notas.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const calcMedia = (student) => {
    if (!formula) return null;
    let sum = 0;
    let weightSum = 0;
    for (const f of formula.fields) {
      const val = student[f.name];
      if (val !== '' && val !== null && val !== undefined) {
        sum += parseFloat(val) * f.weight;
        weightSum += f.weight;
      }
    }
    if (weightSum === 0) return null;
    return parseFloat((sum / weightSum).toFixed(1));
  };

  // Compute Class Average
  const classAverage = useMemo(() => {
    const validMedias = students.map(s => calcMedia(s)).filter(m => m !== null);
    if (validMedias.length === 0) return null;
    const sum = validMedias.reduce((a, b) => a + b, 0);
    return parseFloat((sum / validMedias.length).toFixed(1));
  }, [students, formula]);

  const openObsModal = (student) => {
    setSelectedStudentForObs(student);
    setIsObsModalOpen(true);
  };

  if (!formula) return <div style={{ padding: '20px' }}>Carregando...</div>;

  const hasDrafts = Object.keys(drafts).length > 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
            onClick={() => navigate('/teacher')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-h)', fontSize: '24px' }}>Diário de Notas e Frequência</h1>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>{details?.className} - {details?.subjectName}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '180px' }}>
            <CustomSelect
              value={bimestre}
              onChange={(val) => setBimestre(parseInt(val))}
              options={[
                { value: 1, label: '1º Bimestre' },
                { value: 2, label: '2º Bimestre' },
                { value: 3, label: '3º Bimestre' },
                { value: 4, label: '4º Bimestre' },
              ]}
            />
          </div>
          {activeTab === 'notas' && hasDrafts && (
            <button 
              onClick={handleSaveAll} 
              disabled={savingStatus || isBimestreClosed}
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
              {savingStatus ? 'Salvando...' : 'Salvar Definitivo'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('notas')}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: activeTab === 'notas' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'notas' ? 'var(--accent)' : 'var(--text-light)' }}
        >
          Notas
        </button>
        <button 
          onClick={() => setActiveTab('frequencia')}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: activeTab === 'frequencia' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'frequencia' ? 'var(--accent)' : 'var(--text-light)' }}
        >
          Frequência
        </button>
      </div>

      {activeTab === 'notas' && (
        <>
          {isBimestreClosed && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} />
          <span style={{ fontWeight: 'bold' }}>Este bimestre está fechado. Não é possível alterar notas ou frequências.</span>
        </div>
      )}

      {hasDrafts && !isBimestreClosed && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>Você possui notas em rascunho. Clique em "Salvar Definitivo" para publicar.</span>
        </div>
      )}

      {classAverage !== null && (
        <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-light)' }}>
          Média Geral da Turma: <strong style={{ color: 'var(--text-h)' }}>{classAverage}</strong>
        </div>
      )}

      <Card>
        <div className="datagrid-container" style={{ overflowX: 'auto' }}>
          <table className="datagrid-table gradebook-table" style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Aluno</th>
                {formula.fields.map(f => (
                  <th key={f.name} style={{ width: '100px', padding: '12px' }}>{f.name}</th>
                ))}
                <th style={{ width: '100px', padding: '12px', textAlign: 'center' }}>Média</th>
                <th style={{ width: '80px', padding: '12px', textAlign: 'center' }}>Obs</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const media = calcMedia(student);
                let bgStyle = {};
                let statusColor = 'var(--text)';
                
                if (media !== null && classAverage !== null) {
                  if (media >= classAverage) {
                    bgStyle = { backgroundColor: 'rgba(16, 185, 129, 0.05)' }; // slight green
                    statusColor = '#10b981';
                  } else {
                    bgStyle = { backgroundColor: 'rgba(239, 68, 68, 0.05)' }; // slight red
                    statusColor = '#ef4444';
                  }
                }

                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', ...bgStyle }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-h)' }}>{student.nome}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Mat: {student.matricula}</div>
                    </td>
                    
                    {formula.fields.map(f => {
                      const isDraft = drafts[`${student.id}_${f.name}`] !== undefined;
                      return (
                        <td key={f.name} style={{ padding: '12px' }}>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0" max="10"
                            disabled={isBimestreClosed}
                            style={{ 
                              width: '60px', padding: '6px', borderRadius: '4px',
                              border: `1px solid ${isDraft ? 'var(--accent)' : 'var(--border)'}`,
                              background: isBimestreClosed ? 'var(--code-bg)' : 'var(--bg)', 
                              color: 'var(--text)', textAlign: 'center',
                              cursor: isBimestreClosed ? 'not-allowed' : 'text'
                            }}
                            value={student[f.name] || ''} 
                            onChange={e => handleGradeChange(student.id, f.name, e.target.value)}
                          />
                        </td>
                      );
                    })}

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', color: statusColor, fontSize: '16px' }}>
                        {media !== null ? media : '-'}
                      </div>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => openObsModal(student)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
                        title="Adicionar Observação"
                      >
                        <MessageSquare size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={formula.fields.length + 3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                    Nenhum aluno matriculado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
        </>
      )}

      {activeTab === 'frequencia' && (
        <AttendanceTab 
          classSubjectId={classSubjectId} 
          students={students} 
          isBimestreClosed={isBimestreClosed} 
        />
      )}

      <ObservationModal 
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        student={selectedStudentForObs}
        classSubjectId={classSubjectId}
        bimestre={bimestre}
      />
    </div>
  );
}
