// Simulando um banco de dados local

// Se já existir no localStorage, usamos, se não, inicializamos.
const loadData = (key, defaultData) => {
  const data = localStorage.getItem(`gestor_notas_${key}`);
  return data ? JSON.parse(data) : defaultData;
};

const saveData = (key, data) => {
  localStorage.setItem(`gestor_notas_${key}`, JSON.stringify(data));
};

const defaultUsers = [
  { id: 'u1', nome: 'Admin Principal', email: 'admin@escola.com', password: '123', role: 'ADMIN' },
  { id: 'u2', nome: 'Prof. João Silva', email: 'joao@escola.com', password: '123', role: 'TEACHER' },
  { id: 'u3', nome: 'Prof. Maria Souza', email: 'maria@escola.com', password: '123', role: 'TEACHER' },
];

const defaultStudents = [
  { id: 's1', nome: 'Alice Souza', matricula: '2026001' },
  { id: 's2', nome: 'Bruno Lima', matricula: '2026002' },
  { id: 's3', nome: 'Carlos Mendes', matricula: '2026003' },
  { id: 's4', nome: 'Diana Costa', matricula: '2026004' },
];

const defaultClasses = [
  { id: 'c1', nome: '1º Ano A', ano: 2026 },
  { id: 'c2', nome: '2º Ano A', ano: 2026 },
];

const defaultSubjects = [
  { id: 'sub1', nome: 'Matemática' },
  { id: 'sub2', nome: 'Física' },
  { id: 'sub3', nome: 'História' },
];

// Pivots
// class_id, subject_id, teacher_id
const defaultClassSubjectTeacher = [
  { id: 'cst1', class_id: 'c1', subject_id: 'sub1', teacher_id: 'u2' }, // João ensina Mat no 1º Ano A
  { id: 'cst2', class_id: 'c1', subject_id: 'sub2', teacher_id: 'u2' }, // João ensina Fis no 1º Ano A
  { id: 'cst3', class_id: 'c2', subject_id: 'sub3', teacher_id: 'u3' }, // Maria ensina Hist no 2º Ano A
];

// class_id, student_id
const defaultClassStudents = [
  { class_id: 'c1', student_id: 's1' },
  { class_id: 'c1', student_id: 's2' },
  { class_id: 'c2', student_id: 's3' },
  { class_id: 'c2', student_id: 's4' },
];

// Grades (student_id, class_subject_id, nota_1, nota_2)
// cst1 -> João / Mat / 1º Ano A -> s1, s2
const defaultGrades = [
  { id: 'g1', student_id: 's1', class_subject_id: 'cst1', nota_1: 8.5, nota_2: 9.0 },
  { id: 'g2', student_id: 's2', class_subject_id: 'cst1', nota_1: 6.0, nota_2: 5.5 },
];

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

// Funções Helpers para simular API
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
  
  // Exemplo de helper para Grades
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
