import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import CustomSelect from '../../components/CustomSelect';
import { db, api } from '../../services/mockDb';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './styles.css';

export default function Gradebook() {
  const { classSubjectId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [savingId, setSavingId] = useState(null);
  
  const [bimestre, setBimestre] = useState(1);
  const [formula, setFormula] = useState(null);

  useEffect(() => {
    loadData();
  }, [classSubjectId, bimestre]);

  const loadData = () => {
    const cst = db.classSubjectTeacher.find(c => c.id === classSubjectId);
    if (!cst) return;

    const cls = db.classes.find(c => c.id === cst.class_id);
    const sub = db.subjects.find(s => s.id === cst.subject_id);
    
    setDetails({ className: cls?.nome, subjectName: sub?.nome });

    // Load Formula
    let form = db.gradeFormulas.find(f => f.class_subject_id === classSubjectId);
    if (!form) {
      form = { fields: [{ name: 'AV1', weight: 0.5 }, { name: 'AV2', weight: 0.5 }] };
    }
    setFormula(form);

    // Buscar alunos da turma
    const stIds = db.classStudents.filter(cs => cs.class_id === cst.class_id).map(cs => cs.student_id);
    const classStudents = db.students.filter(s => stIds.includes(s.id));

    // Mesclar com notas do bimestre
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
  };

  const handleSaveGrade = async (studentId, fieldName, value) => {
    setSavingId(studentId);
    let n = value === '' ? null : parseFloat(value);
    
    await api.updateGrade(studentId, classSubjectId, bimestre, fieldName, n);
    
    setTimeout(() => {
      setSavingId(null);
    }, 1000);
  };

  const calcMedia = (student) => {
    if (!formula) return '-';
    let sum = 0;
    let weightSum = 0;
    for (const f of formula.fields) {
      const val = student[f.name];
      if (val !== '' && val !== null && val !== undefined) {
        sum += parseFloat(val) * f.weight;
        weightSum += f.weight;
      }
    }
    if (weightSum === 0) return '-';
    return (sum / weightSum).toFixed(1);
  };

  if (!formula) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px', backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
            onClick={() => navigate('/teacher')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>Diário de Notas</h1>
            <p style={{ margin: 0, color: 'var(--color-text-light)' }}>{details?.className} - {details?.subjectName}</p>
          </div>
        </div>
        
        <div style={{ width: '200px' }}>
          <CustomSelect
            value={bimestre}
            onChange={(val) => setBimestre(parseInt(val))}
            options={[
              { value: 1, label: '1º Bimestre' },
              { value: 2, label: '2º Bimestre' },
              { value: 3, label: '3º Bimestre' },
              { value: 4, label: '4º Bimestre' },
            ]}
            placeholder="Selecione o Bimestre"
          />
        </div>
      </div>

      <Card>
        <div className="datagrid-container">
          <table className="datagrid-table gradebook-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Aluno</th>
                {formula.fields.map(f => (
                  <th key={f.name} style={{ width: '120px' }}>{f.name} (0-10)</th>
                ))}
                <th style={{ width: '100px' }}>Média Bim.</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const media = calcMedia(student);
                let statusColor = 'var(--color-text)';
                if (media !== '-') {
                  statusColor = parseFloat(media) >= 6.0 ? 'var(--color-success)' : 'var(--color-danger)';
                }

                // Check if any grade has been entered to show the checkmark
                const hasAnyGrade = formula.fields.some(f => student[f.name] !== '');

                return (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{student.nome}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>Mat: {student.matricula}</div>
                    </td>
                    
                    {formula.fields.map(f => (
                      <td key={f.name}>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0" max="10"
                          className="grade-input"
                          value={student[f.name] || ''} 
                          onChange={e => handleGradeChange(student.id, f.name, e.target.value)}
                          onBlur={(e) => handleSaveGrade(student.id, f.name, e.target.value)}
                        />
                      </td>
                    ))}

                    <td>
                      <div style={{ fontWeight: '700', color: statusColor, fontSize: '16px' }}>
                        {media}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {savingId === student.id ? (
                        <span style={{ color: 'var(--color-primary)', fontSize: '12px' }}>Salvo</span>
                      ) : (
                        <CheckCircle size={20} style={{ color: 'var(--color-success)', opacity: hasAnyGrade ? 1 : 0.2 }} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={formula.fields.length + 3} style={{ textAlign: 'center', padding: '40px' }}>Nenhum aluno matriculado nesta turma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
