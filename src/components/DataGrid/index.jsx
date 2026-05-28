import React from 'react';
import './styles.css';

export default function DataGrid({ columns, data, keyField = 'id', renderActions }) {
  if (!data || data.length === 0) {
    return <div className="datagrid-empty">Nenhum registro encontrado.</div>;
  }

  return (
    <div className="datagrid-container">
      <table className="datagrid-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width || 'auto' }}>
                {col.header}
              </th>
            ))}
            {renderActions && <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col, idx) => (
                <td key={idx}>
                  {col.render ? col.render(row) : row[col.field]}
                </td>
              ))}
              {renderActions && (
                <td style={{ textAlign: 'center' }}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
