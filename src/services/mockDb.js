// Simulando um banco de dados local

const VERSION = '_v3'; // Alterar para forçar reset do localStorage com novos dados padrão

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
  
  updateGrade: async (student_id, class_subject_id, nota_1, nota_2) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let grade = db.grades.find(g => g.student_id === student_id && g.class_subject_id === class_subject_id);
        if (grade) {
          grade.nota_1 = nota_1 !== undefined ? nota_1 : grade.nota_1;
          grade.nota_2 = nota_2 !== undefined ? nota_2 : grade.nota_2;
        } else {
          grade = {
            id: 'g' + Date.now(),
            student_id,
            class_subject_id,
            nota_1: nota_1 || null,
            nota_2: nota_2 || null
          };
          db.grades.push(grade);
        }
        db.save('grades');
        resolve(grade);
      }, 300);
    });
  }
};
