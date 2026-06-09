import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import { db } from '../../services/mockDb';
import { ArrowLeft } from 'lucide-react';
import AttendanceTab from '../Teacher/AttendanceTab';

export default function AdminAttendanceReport({ classId, onBack }) {
  const [activeTab, setActiveTab] = useState('relatorio'); // 'relatorio' ou 'editar'
  const [selectedCstId, setSelectedCstId] = useState('');
  
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = () => {
    const cls = db.classes.find(c => c.id === classId);
    setClassDetails(cls);

    const stIds = db.classStudents.filter(cs => cs.class_id === classId).map(cs => cs.student_id);
    const classStudents = db.students.filter(s => stIds.includes(s.id));
    setStudents(classStudents);

    const csts = db.classSubjectTeacher.filter(c => c.class_id === classId);
    const subjs = csts.map(cst => {
      const sub = db.subjects.find(s => s.id === cst.subject_id);
      const teacher = db.users.find(u => u.id === cst.teacher_id);
      return {
        cst_id: cst.id,
        subjectName: sub?.nome,
        teacherName: teacher?.nome
      };
    });
    setSubjectsList(subjs);
    if (subjs.length > 0) setSelectedCstId(subjs[0].cst_id);
  };

  const firstBimestreStartDate = useMemo(() => {
    return db.academicCalendar.find(c => c.bimestre === 1)?.start_date || '2026-02-01';
  }, []);

  const countWeekdays = (startStr, endStr) => {
    let start = new Date(startStr + 'T00:00:00');
    let end = new Date(endStr + 'T00:00:00');
    let count = 0;
    while (start <= end) {
      if (start.getDay() !== 0 && start.getDay() !== 6) count++;
      start.setDate(start.getDate() + 1);
    }
    return count;
  };

  // Calcula o % global por aluno
  const reportData = useMemo(() => {
    if (!students.length || !subjectsList.length) return [];
    
    // Pega todos os registros de presença da turma (usando os cst_ids)
    const cstIds = subjectsList.map(s => s.cst_id);
    const classAttendance = db.attendance.filter(a => cstIds.includes(a.class_subject_id));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const pastDaysCount = countWeekdays(firstBimestreStartDate, todayStr);
    const totalPossibleClasses = pastDaysCount * subjectsList.length;
    
    return students.map(student => {
      const studentRecords = classAttendance.filter(a => a.student_id === student.id);
      
      const absences = studentRecords.filter(a => a.status === 'falta').length;
      
      let percentage = 100;
      if (totalPossibleClasses > 0) {
        percentage = Math.max(0, ((totalPossibleClasses - absences) / totalPossibleClasses) * 100);
      }

      return {
        id: student.id,
        nome: student.nome,
        matricula: student.matricula,
        presences: totalPossibleClasses - absences,
        absences,
        percentage: percentage.toFixed(1) + '%'
      };
    });
  }, [students, subjectsList, activeTab, firstBimestreStartDate]);

  const columns = [
    { field: 'nome', header: 'Aluno' },
    { field: 'matricula', header: 'Matrícula' },
    { field: 'absences', header: 'Total de Faltas (Registradas)', render: (row) => <span style={{ color: row.absences > 0 ? '#ef4444' : 'inherit', fontWeight: row.absences > 0 ? 'bold' : 'normal' }}>{row.absences}</span> },
    { field: 'percentage', header: '% Frequência Calculada', render: (row) => {
        const p = parseFloat(row.percentage);
        let color = '#10b981';
        if (p < 75) color = '#ef4444';
        else if (p < 85) color = '#f59e0b';
        return <span style={{ color, fontWeight: 'bold' }}>{row.percentage}</span>;
      } 
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '10px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-h)', fontSize: '24px' }}>Frequência da Turma</h1>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>{classDetails?.nome} - {classDetails?.ano}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('relatorio')}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: activeTab === 'relatorio' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'relatorio' ? 'var(--accent)' : 'var(--text-light)' }}
        >
          Relatório Consolidado
        </button>
        <button 
          onClick={() => setActiveTab('editar')}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: activeTab === 'editar' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'editar' ? 'var(--accent)' : 'var(--text-light)' }}
        >
          Lançar / Corrigir Faltas
        </button>
      </div>

      {activeTab === 'relatorio' && (
        <Card title="Visão Geral de Faltas">
          <DataGrid 
            columns={columns}
            data={reportData}
            minWidth="700px"
          />
        </Card>
      )}

      {activeTab === 'editar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>Selecione a Disciplina:</label>
            <select 
              value={selectedCstId}
              onChange={(e) => setSelectedCstId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minWidth: '250px' }}
            >
              {subjectsList.map(s => (
                <option key={s.cst_id} value={s.cst_id}>{s.subjectName} (Prof. {s.teacherName})</option>
              ))}
            </select>
          </div>

          {selectedCstId ? (
            <AttendanceTab 
              classSubjectId={selectedCstId}
              students={students}
              isBimestreClosed={false} 
            />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>
              Nenhuma disciplina vinculada a esta turma.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
