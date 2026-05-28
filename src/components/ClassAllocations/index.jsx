import React, { useState, useEffect } from 'react';
import Card from '../Card';
import DataGrid from '../DataGrid';
import { db } from '../../services/mockDb';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import CustomSelect from '../CustomSelect';

export default function ClassAllocations({ classId, onBack }) {
  const [classInfo, setClassInfo] = useState(null);
  
  // States para Alunos
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // States para Disciplinas/Professores
  const [classSubjects, setClassSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');

  useEffect(() => {
    const cls = db.classes.find(c => c.id === classId);
    setClassInfo(cls);
    setAllStudents([...db.students]);
    setAllSubjects([...db.subjects]);
    setAllTeachers(db.users.filter(u => u.role === 'Professor'));
  }, [classId]);

  useEffect(() => {
    if (classId) {
      loadAllocations();
    }
  }, [classId]);

  const loadAllocations = () => {
    // Alunos da turma
    const stIds = db.classStudents.filter(cs => cs.class_id === classId).map(cs => cs.student_id);
    const stData = db.students.filter(s => stIds.includes(s.id));
    setClassStudents(stData);

    // Disciplinas da turma
    const subjAlloc = db.classSubjectTeacher.filter(cst => cst.class_id === classId).map(cst => {
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

  const availableStudents = allStudents.filter(s => !classStudents.find(cs => cs.id === s.id));
  const filteredStudents = availableStudents.filter(s => s.nome.toLowerCase().includes(studentSearch.toLowerCase()));

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(student.nome);
    setShowStudentDropdown(false);
  };

  const handleAddStudent = () => {
    if (!selectedStudent) return;
    const exists = db.classStudents.find(cs => cs.class_id === classId && cs.student_id === selectedStudent.id);
    if (!exists) {
      db.classStudents.push({ class_id: classId, student_id: selectedStudent.id });
      db.save('classStudents');
      loadAllocations();
      setStudentSearch('');
      setSelectedStudent(null);
    }
  };

  const handleRemoveStudent = (studentId) => {
    if(window.confirm('Remover aluno desta turma?')) {
      db.classStudents = db.classStudents.filter(cs => !(cs.class_id === classId && cs.student_id === studentId));
      db.save('classStudents');
      loadAllocations();
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectId || !newTeacherId) return;
    const exists = db.classSubjectTeacher.find(cst => cst.class_id === classId && cst.subject_id === newSubjectId);
    if (!exists) {
      db.classSubjectTeacher.push({
        id: 'cst' + Date.now(),
        class_id: classId,
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

  if (!classInfo) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', margin: 0, backgroundColor: 'var(--color-surface)', color: 'var(--color-primary-dark)', border: '1px solid var(--border-color)' }} onClick={onBack}>
          <ArrowLeft size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Voltar para Turmas
        </button>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--color-primary-dark)' }}>
          Alocações: {classInfo.nome} ({classInfo.ano})
        </h2>
      </div>

      <div className="responsive-grid">
        {/* Alunos */}
        <Card title="Alunos da Turma">
          <div className="flex-controls">
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="Digite o nome do aluno..."
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                value={studentSearch}
                onChange={e => {
                  setStudentSearch(e.target.value);
                  setShowStudentDropdown(true);
                  setSelectedStudent(null);
                }}
                onFocus={() => setShowStudentDropdown(true)}
                onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
              />
              {showStudentDropdown && studentSearch && filteredStudents.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {filteredStudents.map(s => (
                    <div 
                      key={s.id} 
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      onMouseDown={() => handleSelectStudent(s)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {s.nome} ({s.matricula})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-primary" style={{ padding: '0', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: 0 }} onClick={handleAddStudent}>
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
          <div className="flex-controls">
            <CustomSelect 
              value={newSubjectId} 
              onChange={setNewSubjectId}
              options={allSubjects.map(s => ({ value: s.id, label: s.nome }))}
              placeholder="-- Disciplina --"
            />
            <CustomSelect 
              value={newTeacherId} 
              onChange={setNewTeacherId}
              options={allTeachers.map(t => ({ value: t.id, label: t.nome }))}
              placeholder="-- Professor --"
            />
            <button className="btn-primary" style={{ padding: '0', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: 0 }} onClick={handleAddSubject}>
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
    </div>
  );
}
