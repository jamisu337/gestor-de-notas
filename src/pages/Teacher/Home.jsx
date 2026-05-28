import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { db } from '../../services/mockDb';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

export default function TeacherHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    // Buscar turmas/disciplinas do professor logado
    const teacherAssignments = db.classSubjectTeacher.filter(cst => cst.teacher_id === user.id);
    
    const detailed = teacherAssignments.map(cst => {
      const cls = db.classes.find(c => c.id === cst.class_id);
      const subject = db.subjects.find(s => s.id === cst.subject_id);
      return {
        id: cst.id, // class_subject_id
        className: cls?.nome,
        classYear: cls?.ano,
        subjectName: subject?.nome
      };
    });

    setAssignments(detailed);
  }, [user]);

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: 'var(--color-primary-dark)' }}>Minhas Turmas</h1>
      
      {assignments.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '40px' }}>
            Nenhuma turma alocada para você no momento.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {assignments.map(item => (
            <Card key={item.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--color-primary-dark)', margin: 0 }}>{item.className}</h3>
                  <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '14px' }}>Ano Letivo: {item.classYear}</p>
                </div>
              </div>
              <p style={{ fontWeight: '500', color: 'var(--color-text)' }}>Disciplina: {item.subjectName}</p>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => navigate(`/teacher/grades/${item.id}`)}
              >
                Lançar Notas
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
