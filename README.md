# 🎓 Gestor de Notas & Frequência Escolar

Um moderno sistema de gestão educacional (Dashboard Escolar) projetado com foco na **melhor Experiência de Usuário (UX/UI)**, unindo praticidade para Professores e controle total para Administradores.

<!-- INSERIR AQUI A IMAGEM DO DASHBOARD PRINCIPAL (Ex: Visão Geral de Turmas/Métricas do Admin) -->
![Dashboard Principal]() 

---

## ✨ Principais Funcionalidades

### 👨‍🏫 Para Professores
- **Diário de Classe Ágil:** Lançamento de notas em um grid inteligente, com auto-save invisível e indicadores de média global da turma para comparação instantânea.
- **Módulo de Frequência "Smart":** Aba dedicada de frequência que ignora fins de semana e possui **Presença Automática** (smart defaults) até o dia atual. O professor só precisa clicar para apontar a "Falta", economizando cliques. Bulk-save para chamadas semanais/mensais!
- **Mural de Observações:** Registro de observações qualitativas e comportamentais para cada aluno de maneira simples e rápida.

<!-- INSERIR AQUI A IMAGEM DO DIÁRIO DE CLASSE / ABA DE FREQUÊNCIA -->
![Diário de Classe e Frequência]()

### 👨‍💼 Para Administradores
- **Relatório Global de Frequência:** Visualize a porcentagem exata de presença de cada aluno da turma. O administrador também pode corrigir faltas selecionando a disciplina de qualquer professor.
- **Importação em Massa (CSV):** Adicione centenas de alunos ou usuários de uma vez através de um sistema Drag-and-Drop funcional e veloz.
- **Calendário Acadêmico:** Configure as datas de início e fim dos bimestres e tenha o poder de travar a inserção de novas notas após o fechamento.
- **Auditoria de Ações (AuditLogs):** Rastreabilidade total! Veja quem modificou a nota de qual aluno e o exato momento em que ocorreu.

<!-- INSERIR AQUI A IMAGEM DA TELA DE IMPORTAÇÃO CSV OU DA TELA DE AUDITORIA -->
![Tela de Administração]()

---

## 🎨 UI/UX Premium
O projeto foi moldado pensando num uso fluido para leigos em tecnologia:
- **Dark Mode / Light Mode:** Alternância nativa de temas integrada com variáveis puras no CSS, garantindo uma leitura confortável à noite.
- **Micro-interações:** Toasts não-intrusivos (mensagens de sucesso/erro) no canto da tela e Loaders caprichados que evitam o travamento visual durante processos demorados.

---

## 🛠️ Tecnologias Utilizadas
- **React.js + Vite** (Performance e componentização)
- **CSS Vanilla (CSS Modules)** (Para um controle total, leve e personalizado do design sem depender de bibliotecas pesadas)
- **Lucide React** (Pacote de ícones minimalistas e modernos)
- **Mock DB Interno** (Uso de `localStorage` para simular requisições HTTP assíncronas e armazenamento persistente sem a necessidade de um backend real rodando localmente)

---

## 🚀 Como Rodar o Projeto

1. Faça o clone do repositório:
```bash
git clone https://github.com/jamisu337/gestor-de-notas.git
```

2. Entre na pasta do projeto:
```bash
cd gestor-de-notas
```

3. Instale as dependências:
```bash
npm install
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse `http://localhost:5173` no seu navegador e aproveite!

---
*Desenvolvido com 🩵 e foco total na experiência do usuário educacional.*
