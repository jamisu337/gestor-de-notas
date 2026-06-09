// Simulando um banco de dados local

const VERSION = '_v5'; // Alterar para forçar reset do localStorage com novos dados padrão

const loadData = (key, defaultData) => {
  const data = localStorage.getItem(`gestor_notas_${key}${VERSION}`);
  return data ? JSON.parse(data) : defaultData;
};

const saveData = (key, data) => {
  localStorage.setItem(`gestor_notas_${key}${VERSION}`, JSON.stringify(data));
};

const defaultUsers = [
  { id: 'u1', nome: 'Admin Principal', email: 'admin@escola.com', password: '123', role: 'Administrador' },
  { id: 'u2', nome: 'João Silva (Matemática)', email: 'joao@escola.com', password: '123', role: 'Professor' },
  { id: 'u3', nome: 'Maria Souza (Português)', email: 'maria@escola.com', password: '123', role: 'Professor' },
  { id: 'u4', nome: 'Carlos Mendes (Ciências/Física/Química)', email: 'carlos@escola.com', password: '123', role: 'Professor' },
  { id: 'u5', nome: 'Ana Lima (História/Geografia)', email: 'ana@escola.com', password: '123', role: 'Professor' },
  { id: 'u6', nome: 'Roberto Dias (Inglês/Artes)', email: 'roberto@escola.com', password: '123', role: 'Professor' },
];

const studentNames = [
  'Alice Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Ferreira', 'Eduarda Souza',
  'Felipe Rocha', 'Gabriela Lima', 'Henrique Alves', 'Isabela Ribeiro', 'João Martins',
  'Karina Gomes', 'Lucas Santos', 'Mariana Dias', 'Nicolas Cardoso', 'Olivia Fernandes',
  'Pedro Carvalho', 'Quintino Neves', 'Rafaela Barbosa', 'Samuel Pinto', 'Tatiana Castro',
  'Ulisses Moraes', 'Vitoria Campos', 'Wagner Nogueira', 'Ximena Vieira', 'Yuri Monteiro',
  'Zilda Batista', 'Artur Azevedo'
];

const generateRandomPhone = () => {
  const ddd = Math.floor(Math.random() * (99 - 11 + 1)) + 11;
  const part1 = Math.floor(Math.random() * (99999 - 90000 + 1)) + 90000;
  const part2 = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  return `(${ddd}) ${part1}-${part2}`;
};

const defaultStudents = studentNames.map((name, i) => {
  const nameParts = name.split(' ');
  const firstName = nameParts[0].toLowerCase();
  const lastName = nameParts[nameParts.length - 1].toLowerCase();
  
  return {
    id: `s${i + 1}`,
    nome: name,
    matricula: `20260${(i + 1).toString().padStart(2, '0')}`,
    email: `${firstName}${lastName}@escola.com`,
    telefone: generateRandomPhone()
  };
});

const defaultClasses = [
  { id: 'c1', nome: '1º Ano A', ano: 2026 },
  { id: 'c2', nome: '2º Ano A', ano: 2026 },
  { id: 'c3', nome: '3º Ano A', ano: 2026 },
  { id: 'c4', nome: '4º Ano A', ano: 2026 },
  { id: 'c5', nome: '5º Ano A', ano: 2026 },
  { id: 'c6', nome: '6º Ano A', ano: 2026 },
  { id: 'c7', nome: '7º Ano A', ano: 2026 },
  { id: 'c8', nome: '8º Ano A', ano: 2026 },
  { id: 'c9', nome: '9º Ano A', ano: 2026 },
];

const defaultSubjects = [
  { id: 'sub1', nome: 'Matemática' },
  { id: 'sub2', nome: 'Português' },
  { id: 'sub3', nome: 'Ciências' },
  { id: 'sub4', nome: 'História' },
  { id: 'sub5', nome: 'Geografia' },
  { id: 'sub6', nome: 'Inglês' },
  { id: 'sub7', nome: 'Artes' },
  { id: 'sub8', nome: 'Educação Física' },
];

const defaultClassSubjectTeacher = [];
const defaultClassStudents = [];
const defaultGrades = [];
const defaultGradeFormulas = []; // Nova tabela para Fórmulas de Notas

const defaultAttendance = [];
const defaultObservations = [];
const defaultAcademicCalendar = [
  { id: 'cal1', bimestre: 1, start_date: '2026-02-01', end_date: '2026-04-30', is_locked: false },
  { id: 'cal2', bimestre: 2, start_date: '2026-05-01', end_date: '2026-07-15', is_locked: false },
  { id: 'cal3', bimestre: 3, start_date: '2026-08-01', end_date: '2026-09-30', is_locked: false },
  { id: 'cal4', bimestre: 4, start_date: '2026-10-01', end_date: '2026-12-15', is_locked: false },
];
const defaultAuditLogs = [];

// Distribuindo alunos nas turmas (3 alunos por turma para dar 27)
let studentIndex = 0;
defaultClasses.forEach(c => {
  for (let i = 0; i < 3; i++) {
    if (studentIndex < defaultStudents.length) {
      defaultClassStudents.push({
        class_id: c.id,
        student_id: defaultStudents[studentIndex].id
      });
      studentIndex++;
    }
  }
});

// Distribuindo professores e disciplinas nas turmas
defaultClasses.forEach(c => {
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub1`, class_id: c.id, subject_id: 'sub1', teacher_id: 'u2' }); // Mat
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub2`, class_id: c.id, subject_id: 'sub2', teacher_id: 'u3' }); // Port
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub3`, class_id: c.id, subject_id: 'sub3', teacher_id: 'u4' }); // Ciencias
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub4`, class_id: c.id, subject_id: 'sub4', teacher_id: 'u5' }); // Historia
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub5`, class_id: c.id, subject_id: 'sub5', teacher_id: 'u5' }); // Geografia
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub6`, class_id: c.id, subject_id: 'sub6', teacher_id: 'u6' }); // Inglês
  defaultClassSubjectTeacher.push({ id: `cst_${c.id}_sub7`, class_id: c.id, subject_id: 'sub7', teacher_id: 'u6' }); // Artes
});

export const db = {
  users: loadData('users', defaultUsers),
  students: loadData('students', defaultStudents),
  classes: loadData('classes', defaultClasses),
  subjects: loadData('subjects', defaultSubjects),
  classSubjectTeacher: loadData('classSubjectTeacher', defaultClassSubjectTeacher),
  classStudents: loadData('classStudents', defaultClassStudents),
  grades: loadData('grades', defaultGrades),
  gradeFormulas: loadData('gradeFormulas', defaultGradeFormulas),
  attendance: loadData('attendance', defaultAttendance),
  observations: loadData('observations', defaultObservations),
  academicCalendar: loadData('academicCalendar', defaultAcademicCalendar),
  auditLogs: loadData('auditLogs', defaultAuditLogs),
  
  save(table) {
    saveData(table, this[table]);
  }
};

export const api = {
  login: async (email, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = db.users.find(u => u.email === email && u.password === password && u.role === role);
        if (user) resolve(user);
        else reject(new Error('Credenciais inválidas'));
      }, 500);
    });
  },
  
  createAuditLog: async (user_id, action, details) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const log = {
          id: 'log' + Date.now(),
          user_id,
          action,
          details,
          timestamp: new Date().toISOString()
        };
        db.auditLogs.unshift(log); // Adiciona no início
        db.save('auditLogs');
        resolve(log);
      }, 100);
    });
  },

  updateGrade: async (student_id, class_subject_id, bimestre, field, value, user_id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let grade = db.grades.find(g => g.student_id === student_id && g.class_subject_id === class_subject_id && g.bimestre === bimestre);
        if (grade) {
          grade.values[field] = value;
        } else {
          grade = {
            id: 'g' + Date.now(),
            student_id,
            class_subject_id,
            bimestre,
            values: { [field]: value }
          };
          db.grades.push(grade);
        }
        db.save('grades');

        if (user_id) {
          const student = db.students.find(s => s.id === student_id);
          const userName = db.users.find(u => u.id === user_id)?.nome || user_id;
          api.createAuditLog(user_id, 'UPDATE_GRADE', `Nota (${field}: ${value}) de ${student?.nome || student_id} no ${bimestre}º Bimestre atualizada por ${userName}`);
        }

        resolve(grade);
      }, 300);
    });
  },

  updateFormula: async (class_subject_id, fields) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let formula = db.gradeFormulas.find(f => f.class_subject_id === class_subject_id);
        if (formula) {
          formula.fields = fields;
        } else {
          formula = {
            id: 'f' + Date.now(),
            class_subject_id,
            fields
          };
          db.gradeFormulas.push(formula);
        }
        db.save('gradeFormulas');
        resolve(formula);
      }, 300);
    });
  },

  saveAttendance: async (student_id, class_subject_id, date, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let record = db.attendance.find(a => a.student_id === student_id && a.class_subject_id === class_subject_id && a.date === date);
        if (record) {
          record.status = status;
        } else {
          record = {
            id: 'att' + Date.now(),
            student_id,
            class_subject_id,
            date,
            status
          };
          db.attendance.push(record);
        }
        db.save('attendance');
        resolve(record);
      }, 300);
    });
  },

  bulkSaveAttendance: async (records) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        records.forEach(({ student_id, class_subject_id, date, status }) => {
          let record = db.attendance.find(a => a.student_id === student_id && a.class_subject_id === class_subject_id && a.date === date);
          if (record) {
            record.status = status;
          } else {
            record = {
              id: 'att' + Date.now() + Math.random().toString(36).substr(2, 5),
              student_id,
              class_subject_id,
              date,
              status
            };
            db.attendance.push(record);
          }
        });
        db.save('attendance');
        resolve(true);
      }, 500);
    });
  },

  saveObservation: async (student_id, class_subject_id, bimestre, text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let obs = db.observations.find(o => o.student_id === student_id && o.class_subject_id === class_subject_id && o.bimestre === bimestre);
        if (obs) {
          obs.text = text;
          obs.timestamp = new Date().toISOString();
        } else {
          obs = {
            id: 'obs' + Date.now(),
            student_id,
            class_subject_id,
            bimestre,
            text,
            timestamp: new Date().toISOString()
          };
          db.observations.push(obs);
        }
        db.save('observations');
        resolve(obs);
      }, 300);
    });
  },

  updateCalendar: async (id, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cal = db.academicCalendar.find(c => c.id === id);
        if (cal) {
          Object.assign(cal, updates);
          db.save('academicCalendar');
        }
        resolve(cal);
      }, 300);
    });
  },

  bulkImportUsers: async (usersData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUsers = usersData.map((u, i) => ({
          id: 'u_bulk_' + Date.now() + i,
          ...u
        }));
        db.users = [...db.users, ...newUsers];
        db.save('users');
        resolve(newUsers);
      }, 800);
    });
  },

  bulkImportStudents: async (studentsData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudents = studentsData.map((s, i) => ({
          id: 's_bulk_' + Date.now() + i,
          ...s
        }));
        db.students = [...db.students, ...newStudents];
        db.save('students');
        resolve(newStudents);
      }, 800);
    });
  }
};
