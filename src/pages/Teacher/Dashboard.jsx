import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import TeacherHome from './Home';
import Gradebook from './Gradebook';

export default function TeacherDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/grades/:classSubjectId" element={<Gradebook />} />
      </Routes>
    </Layout>
  );
}
