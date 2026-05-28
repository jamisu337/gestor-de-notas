import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import AdminHome from './Home';
import ManageClasses from './ManageClasses';
import ManageUsers from './ManageUsers';
import ManageSubjects from './ManageSubjects';
import AdminGrades from './AdminGrades';

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/classes" element={<ManageClasses />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/subjects" element={<ManageSubjects />} />
        <Route path="/grades" element={<AdminGrades />} />
      </Routes>
    </Layout>
  );
}
