import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import { db } from '../../services/mockDb';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // In a real app we would call an API. Here we just read from mockDb.
    setLogs(db.auditLogs);
  }, []);

  const columns = [
    { field: 'timestamp', header: 'Data/Hora', render: (row) => new Date(row.timestamp).toLocaleString() },
    { field: 'user_id', header: 'Usuário', render: (row) => {
        const user = db.users.find(u => u.id === row.user_id);
        return user ? user.nome : row.user_id;
    }},
    { field: 'action', header: 'Ação' },
    { field: 'details', header: 'Detalhes' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Logs de Auditoria</h1>
      <Card title="Histórico de Ações Críticas">
        {logs.length > 0 ? (
          <DataGrid data={logs} columns={columns} />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>
            Nenhum log registrado ainda.
          </div>
        )}
      </Card>
    </div>
  );
}
