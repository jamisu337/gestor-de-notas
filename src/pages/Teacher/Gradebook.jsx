import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { db, api } from '../../services/mockDb';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './styles.css';

export default function Gradebook() {
  const { classSubjectId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [classSubjectId]);

  const loadData = () => {
    const cst = db.classSubjectTeacher.find(c => c.id === classSubjectId);
    if (!cst) return;

    const cls = db.classes.find(c => c.id === cst.class_id);
    const sub = db.subjects.find(s => s.id === cst.subject_id);
    
    setDetails({ className: cls?.nome, subjectName: sub?.nome });

    // Buscar alunos da turma
    const stIds = db.classStudents.filter(cs => cs.class_id === cst.class_id).map(cs => cs.student_id);
    const classStudents = db.students.filter(s => stIds.includes(s.id));

    // Mesclar com notas
    const studentsWithGrades = classStudents.map(student => {
      const grade = db.grades.find(g => g.student_id === student.id && g.class_subject_id === classSubjectId);
      return {
        ...student,
        nota_1: grade?.nota_1 !== null && grade?.nota_1 !== undefined ? grade.nota_1 : '',
        nota_2: grade?.nota_2 !== null && grade?.nota_2 !== undefined ? grade.nota_2 : ''
      };
    });

    setStudents(studentsWithGrades);
  };

  const handleGradeChange = (studentId, field, value) => {
    let numValue = value.replace(',', '.'); // Permitir vírgula ou ponto
    
    // Validação estrita 0 a 10
    if (numValue !== '') {
      let parsed = parseFloat(numValue);
      if (isNaN(parsed)) return;
      if (parsed < 0) numValue = '0';
      if (parsed > 10) numValue = '10';
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, [field]: numValue };
      }
      return s;
    }));
  };

  const handleSaveGrade = async (studentId, nota_1, nota_2) => {
    setSavingId(studentId);
    let n1 = nota_1 === '' ? null : parseFloat(nota_1);
    let n2 = nota_2 === '' ? null : parseFloat(nota_2);
    
    await api.updateGrade(studentId, classSubjectId, n1, n2);
    
    setTimeout(() => {
      setSavingId(null);
    }, 1000);
  };

  const calcMedia = (n1, n2) => {
    if (n1 === '' || n2 === '') return '-';
    const num1 = parseFloat(n1);
    const num2 = parseFloat(n2);
    if (isNaN(num1) || isNaN(num2)) return '-';
    return ((num1 + num2) / 2).toFixed(1);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
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

      <Card>
        <div className="datagrid-container">
          <table className="datagrid-table gradebook-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th style={{ width: '150px' }}>AV1 (0-10)</th>
                <th style={{ width: '150px' }}>AV2 (0-10)</th>
                <th style={{ width: '120px' }}>Média</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const media = calcMedia(student.nota_1, student.nota_2);
                let statusColor = 'var(--color-text)';
                if (media !== '-') {
                  statusColor = parseFloat(media) >= 6.0 ? 'var(--color-success)' : 'var(--color-danger)';
                }

                return (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{student.nome}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>Mat: {student.matricula}</div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" max="10"
                        className="grade-input"
                        value={student.nota_1} 
                        onChange={e => handleGradeChange(student.id, 'nota_1', e.target.value)}
                        onBlur={() => handleSaveGrade(student.id, student.nota_1, student.nota_2)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" max="10"
                        className="grade-input"
                        value={student.nota_2} 
                        onChange={e => handleGradeChange(student.id, 'nota_2', e.target.value)}
                        onBlur={() => handleSaveGrade(student.id, student.nota_1, student.nota_2)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: statusColor, fontSize: '16px' }}>
                        {media}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {savingId === student.id ? (
                        <span style={{ color: 'var(--color-primary)', fontSize: '12px' }}>Salvando...</span>
                      ) : (
                        <CheckCircle size={20} style={{ color: 'var(--color-success)', opacity: (student.nota_1 !== '' || student.nota_2 !== '') ? 1 : 0.2 }} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Nenhum aluno matriculado nesta turma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
