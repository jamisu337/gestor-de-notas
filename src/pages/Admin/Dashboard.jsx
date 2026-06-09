import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import AdminHome from './Home';
import ManageClasses from './ManageClasses';
import ManageUsers from './ManageUsers';
import ManageSubjects from './ManageSubjects';
import AdminGrades from './AdminGrades';
import AuditLogs from './AuditLogs';
import AcademicCalendar from './AcademicCalendar';
import BulkImport from './BulkImport';

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/classes" element={<ManageClasses />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/subjects" element={<ManageSubjects />} />
        <Route path="/grades" element={<AdminGrades />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/calendar" element={<AcademicCalendar />} />
        <Route path="/import" element={<BulkImport />} />
      </Routes>
    </Layout>
  );
}
