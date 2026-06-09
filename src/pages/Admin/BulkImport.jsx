import React, { useState } from 'react';
import Card from '../../components/Card';
import { api } from '../../services/mockDb';
import { useToast } from '../../contexts/ToastContext';
import Loader from '../../components/Loader';
import { Upload } from 'lucide-react';

export default function BulkImport() {
  const [loading, setLoading] = useState(false);
  const [importType, setImportType] = useState('students');
  const { addToast } = useToast();

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (currentLine.length === headers.length) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = currentLine[index];
        });
        result.push(obj);
      }
    }
    return result;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addToast('Por favor, selecione um arquivo CSV válido.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      setLoading(true);
      try {
        const text = event.target.result;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          addToast('Arquivo vazio ou formato inválido.', 'error');
          return;
        }

        if (importType === 'students') {
          await api.bulkImportStudents(data);
          addToast(`${data.length} alunos importados com sucesso!`, 'success');
        } else {
          await api.bulkImportUsers(data);
          addToast(`${data.length} usuários importados com sucesso!`, 'success');
        }
      } catch (err) {
        addToast('Erro ao processar o arquivo.', 'error');
      } finally {
        setLoading(false);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Importação em Massa</h1>
      <Card title="Upload de CSV">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tipo de Dados:</label>
            <select 
              value={importType} 
              onChange={(e) => setImportType(e.target.value)}
              style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            >
              <option value="students">Alunos (nome, email, matricula, telefone)</option>
              <option value="users">Professores/Admins (nome, email, password, role)</option>
            </select>
          </div>
          
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer'
              }}
            />
            <Upload size={32} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
            <p>Clique ou arraste um arquivo CSV aqui</p>
          </div>
        </div>
        {loading && <Loader fullScreen />}
      </Card>
    </div>
  );
}
