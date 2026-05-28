import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import { db } from '../../services/mockDb';
import { Plus, Trash2 } from 'lucide-react';

export default function Allocations() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // States para Alunos
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [newStudentId, setNewStudentId] = useState('');

  // States para Disciplinas/Professores
  const [classSubjects, setClassSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');

  useEffect(() => {
    setClasses([...db.classes]);
    setAllStudents([...db.students]);
    setAllSubjects([...db.subjects]);
    setAllTeachers(db.users.filter(u => u.role === 'TEACHER'));
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadAllocations();
    }
  }, [selectedClassId]);

  const loadAllocations = () => {
    // Alunos da turma
    const stIds = db.classStudents.filter(cs => cs.class_id === selectedClassId).map(cs => cs.student_id);
    const stData = db.students.filter(s => stIds.includes(s.id));
    setClassStudents(stData);

    // Disciplinas da turma
    const subjAlloc = db.classSubjectTeacher.filter(cst => cst.class_id === selectedClassId).map(cst => {
      const subject = db.subjects.find(s => s.id === cst.subject_id);
      const teacher = db.users.find(u => u.id === cst.teacher_id);
      return {
        id: cst.id,
        subjectName: subject?.nome || 'Desconhecida',
        teacherName: teacher?.nome || 'Desconhecido'
      };
    });
    setClassSubjects(subjAlloc);
  };

  const handleAddStudent = () => {
    if (!newStudentId) return;
    const exists = db.classStudents.find(cs => cs.class_id === selectedClassId && cs.student_id === newStudentId);
    if (!exists) {
      db.classStudents.push({ class_id: selectedClassId, student_id: newStudentId });
      db.save('classStudents');
      loadAllocations();
      setNewStudentId('');
    }
  };

  const handleRemoveStudent = (studentId) => {
    if(window.confirm('Remover aluno desta turma?')) {
      db.classStudents = db.classStudents.filter(cs => !(cs.class_id === selectedClassId && cs.student_id === studentId));
      db.save('classStudents');
      loadAllocations();
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectId || !newTeacherId) return;
    const exists = db.classSubjectTeacher.find(cst => cst.class_id === selectedClassId && cst.subject_id === newSubjectId);
    if (!exists) {
      db.classSubjectTeacher.push({
        id: 'cst' + Date.now(),
        class_id: selectedClassId,
        subject_id: newSubjectId,
        teacher_id: newTeacherId
      });
      db.save('classSubjectTeacher');
      loadAllocations();
      setNewSubjectId('');
      setNewTeacherId('');
    } else {
      alert('Esta disciplina já está alocada para esta turma.');
    }
  };

  const handleRemoveSubject = (id) => {
    if(window.confirm('Remover esta alocação?')) {
      db.classSubjectTeacher = db.classSubjectTeacher.filter(cst => cst.id !== id);
      db.save('classSubjectTeacher');
      loadAllocations();
    }
  };

  return (
    <div>
      <Card title="Alocações">
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label>Selecione uma Turma</label>
          <select 
            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.ano})</option>)}
          </select>
        </div>
      </Card>

      {selectedClassId && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Alunos */}
          <Card title="Alunos da Turma">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <select 
                style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                value={newStudentId} 
                onChange={e => setNewStudentId(e.target.value)}
              >
                <option value="">-- Selecionar Aluno --</option>
                {allStudents.filter(s => !classStudents.find(cs => cs.id === s.id)).map(s => (
                  <option key={s.id} value={s.id}>{s.nome} ({s.matricula})</option>
                ))}
              </select>
              <button className="btn-primary" style={{ margin: 0, padding: '0 16px', width: 'auto' }} onClick={handleAddStudent}>
                <Plus size={18} />
              </button>
            </div>
            
            <DataGrid 
              columns={[{ field: 'nome', header: 'Nome' }, { field: 'matricula', header: 'Matrícula' }]}
              data={classStudents}
              renderActions={(row) => (
                <button className="action-btn delete" onClick={() => handleRemoveStudent(row.id)}><Trash2 size={16} /></button>
              )}
            />
          </Card>

          {/* Professores e Disciplinas */}
          <Card title="Disciplinas e Professores">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <select 
                style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                value={newSubjectId} 
                onChange={e => setNewSubjectId(e.target.value)}
              >
                <option value="">-- Disciplina --</option>
                {allSubjects.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              <select 
                style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                value={newTeacherId} 
                onChange={e => setNewTeacherId(e.target.value)}
              >
                <option value="">-- Professor --</option>
                {allTeachers.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              <button className="btn-primary" style={{ margin: 0, padding: '0 16px', width: 'auto' }} onClick={handleAddSubject}>
                <Plus size={18} />
              </button>
            </div>
            
            <DataGrid 
              columns={[{ field: 'subjectName', header: 'Disciplina' }, { field: 'teacherName', header: 'Professor' }]}
              data={classSubjects}
              renderActions={(row) => (
                <button className="action-btn delete" onClick={() => handleRemoveSubject(row.id)}><Trash2 size={16} /></button>
              )}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
