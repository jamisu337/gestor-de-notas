import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import DataGrid from '../../components/DataGrid';
import CustomSelect from '../../components/CustomSelect';
import Modal from '../../components/Modal';
import { db, api } from '../../services/mockDb';
import { Download, Settings, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminGrades() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  const [students, setStudents] = useState([]);
  const [formula, setFormula] = useState(null);
  const [cstId, setCstId] = useState(null);

  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [editingFields, setEditingFields] = useState([]);

  useEffect(() => {
    setClasses(db.classes);
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const classSubjects = db.classSubjectTeacher.filter(cst => cst.class_id === selectedClassId);
      const subs = classSubjects.map(cst => {
        const s = db.subjects.find(sub => sub.id === cst.subject_id);
        return { id: cst.subject_id, nome: s?.nome, cst_id: cst.id };
      });
      setSubjects(subs);
      setSelectedSubjectId('');
      setStudents([]);
      setFormula(null);
      setCstId(null);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      loadGradesData();
    }
  }, [selectedClassId, selectedSubjectId]);

  const loadGradesData = () => {
    const cst = subjects.find(s => s.id === selectedSubjectId);
    if (!cst) return;
    setCstId(cst.cst_id);

    let form = db.gradeFormulas.find(f => f.class_subject_id === cst.cst_id);
    if (!form) {
      form = { fields: [{ name: 'AV1', weight: 0.5 }, { name: 'AV2', weight: 0.5 }] }; // default
    }
    setFormula(form);
    setEditingFields([...form.fields]);

    const stIds = db.classStudents.filter(cs => cs.class_id === selectedClassId).map(cs => cs.student_id);
    const classStudents = db.students.filter(s => stIds.includes(s.id));

    // Calculate averages per student
    const studentsWithData = classStudents.map(student => {
      const studentGrades = db.grades.filter(g => g.student_id === student.id && g.class_subject_id === cst.cst_id);
      
      const bimestresData = {};
      let totalGeral = 0;
      let countBimestres = 0;

      [1, 2, 3, 4].forEach(b => {
        const bg = studentGrades.find(g => g.bimestre === b);
        let media = null;
        if (bg && bg.values) {
          let sum = 0;
          let weightSum = 0;
          form.fields.forEach(f => {
            if (bg.values[f.name] !== undefined && bg.values[f.name] !== null) {
              sum += parseFloat(bg.values[f.name]) * f.weight;
              weightSum += f.weight;
            }
          });
          if (weightSum > 0) {
            media = (sum / weightSum).toFixed(1);
            totalGeral += parseFloat(media);
            countBimestres++;
          }
        }
        bimestresData[`b${b}`] = media !== null ? media : '-';
      });

      return {
        ...student,
        ...bimestresData,
        mediaFinal: countBimestres > 0 ? (totalGeral / countBimestres).toFixed(1) : '-'
      };
    });

    setStudents(studentsWithData);
  };

  const handleSaveFormula = async (e) => {
    e.preventDefault();
    if (!cstId) return;
    const totalWeight = editingFields.reduce((acc, f) => acc + parseFloat(f.weight), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      alert('A soma dos pesos deve ser igual a 1.0 (ex: 0.5 + 0.5). Atualmente é: ' + totalWeight);
      return;
    }
    await api.updateFormula(cstId, editingFields);
    setIsFormulaModalOpen(false);
    loadGradesData(); // reload
  };

  const addField = () => {
    setEditingFields([...editingFields, { name: 'Nova Nota', weight: 0.0 }]);
  };

  const updateField = (idx, key, value) => {
    const newFields = [...editingFields];
    newFields[idx][key] = key === 'weight' ? parseFloat(value) || 0 : value;
    setEditingFields(newFields);
  };

  const removeField = (idx) => {
    setEditingFields(editingFields.filter((_, i) => i !== idx));
  };

  const exportPDF = () => {
    const cls = classes.find(c => c.id === selectedClassId);
    const sub = subjects.find(s => s.id === selectedSubjectId);
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Notas', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Turma: ${cls.nome} - Ano: ${cls.ano}`, 14, 30);
    doc.text(`Disciplina: ${sub.nome}`, 14, 36);

    const tableColumn = ["Aluno", "1º Bim", "2º Bim", "3º Bim", "4º Bim", "Média Final"];
    const tableRows = [];

    students.forEach(student => {
      const studentData = [
        student.nome,
        student.b1,
        student.b2,
        student.b3,
        student.b4,
        student.mediaFinal
      ];
      tableRows.push(studentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [94, 75, 138] }
    });

    doc.save(`notas_${cls.nome}_${sub.nome}.pdf`);
  };

  const columns = [
    { field: 'nome', header: 'Aluno' },
    { field: 'b1', header: '1º Bim' },
    { field: 'b2', header: '2º Bim' },
    { field: 'b3', header: '3º Bim' },
    { field: 'b4', header: '4º Bim' },
    { field: 'mediaFinal', header: 'Média Final' },
  ];

  return (
    <div>
      <Card 
        title="Análise de Notas e Relatórios"
        action={
          students.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => setIsFormulaModalOpen(true)}>
                <Settings size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Fórmula de Notas
              </button>
              <button className="btn-primary" onClick={exportPDF}>
                <Download size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Exportar PDF
              </button>
            </div>
          )
        }
      >
        <div className="flex-controls" style={{ marginBottom: '24px' }}>
          <CustomSelect
            value={selectedClassId}
            onChange={setSelectedClassId}
            options={classes.map(c => ({ value: c.id, label: `${c.nome} (${c.ano})` }))}
            placeholder="-- Selecione a Turma --"
          />
          <CustomSelect
            value={selectedSubjectId}
            onChange={setSelectedSubjectId}
            options={subjects.map(s => ({ value: s.id, label: s.nome }))}
            placeholder="-- Selecione a Disciplina --"
            style={{ opacity: selectedClassId ? 1 : 0.5, pointerEvents: selectedClassId ? 'auto' : 'none' }}
          />
        </div>

        {selectedClassId && selectedSubjectId ? (
          <DataGrid 
            columns={columns} 
            data={students}
            minWidth="600px"
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
            Selecione uma turma e disciplina para visualizar as notas.
          </div>
        )}
      </Card>

      <Modal isOpen={isFormulaModalOpen} onClose={() => setIsFormulaModalOpen(false)} title="Configurar Fórmula de Notas">
        <form onSubmit={handleSaveFormula}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '16px' }}>
            Defina os campos que os professores deverão preencher e o peso de cada um para o cálculo da média do bimestre. <b>A soma dos pesos deve ser igual a 1.0</b> (Ex: 0.5 e 0.5).
          </p>
          
          {editingFields.map((field, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={field.name} 
                onChange={(e) => updateField(idx, 'name', e.target.value)}
                style={{ flex: 2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Nome da Avaliação"
                required
              />
              <input 
                type="number" 
                step="0.1" 
                min="0" max="1"
                value={field.weight} 
                onChange={(e) => updateField(idx, 'weight', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Peso"
                required
              />
              <button type="button" onClick={() => removeField(idx)} style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          <button type="button" onClick={addField} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-background)', border: '1px dashed #ccc', borderRadius: '4px', color: 'var(--color-primary)', cursor: 'pointer', marginBottom: '24px', width: '100%', justifyContent: 'center' }}>
            <Plus size={16} /> Adicionar Avaliação
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: editingFields.reduce((a,f) => a + f.weight, 0) === 1 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              Soma dos Pesos: {editingFields.reduce((acc, f) => acc + (f.weight || 0), 0).toFixed(2)}
            </span>
            <button type="submit" className="btn-primary">Salvar Fórmula</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
