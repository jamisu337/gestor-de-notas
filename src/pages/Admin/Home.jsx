import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { db } from '../../services/mockDb';

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, students: 0, classes: 0, subjects: 0 });

  useEffect(() => {
    setStats({
      users: db.users.length,
      students: db.students.length,
      classes: db.classes.length,
      subjects: db.subjects.length,
    });
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: 'var(--color-primary-dark)' }}>Dashboard Administrativo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <Card title="Usuários">
          <h2 style={{ fontSize: '36px', color: 'var(--color-primary)' }}>{stats.users}</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Professores e Admins</p>
        </Card>
        
        <Card title="Alunos">
          <h2 style={{ fontSize: '36px', color: 'var(--color-primary)' }}>{stats.students}</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Matriculados</p>
        </Card>
        
        <Card title="Turmas">
          <h2 style={{ fontSize: '36px', color: 'var(--color-primary)' }}>{stats.classes}</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Ativas este ano</p>
        </Card>

        <Card title="Disciplinas">
          <h2 style={{ fontSize: '36px', color: 'var(--color-primary)' }}>{stats.subjects}</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Cadastradas</p>
        </Card>
      </div>
    </div>
  );
}
