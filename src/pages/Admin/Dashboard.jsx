import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import AdminHome from './Home';
import ManageClasses from './ManageClasses';
import ManageUsers from './ManageUsers';
import ManageSubjects from './ManageSubjects';
import Allocations from './Allocations'; // Será criado no próximo passo

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/classes" element={<ManageClasses />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/subjects" element={<ManageSubjects />} />
        <Route path="/allocations" element={<Allocations />} />
      </Routes>
    </Layout>
  );
}
