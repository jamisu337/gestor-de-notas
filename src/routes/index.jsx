import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import Login from '../pages/Login';
import AdminDashboard from '../pages/Admin/Dashboard';
import TeacherDashboard from '../pages/Teacher/Dashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teacher/*" 
          element={
            <PrivateRoute requiredRole="TEACHER">
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
