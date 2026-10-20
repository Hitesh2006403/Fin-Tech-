import React from 'react';
import { AdminProvider, useAdmin } from '../../context/AdminContext.jsx';
import { AdminLoginPage } from './AdminLoginPage.jsx';
import { AdminLayout } from './AdminLayout.jsx';
import { Background3D } from '../../components/common/Background3D.jsx';

function AdminPortalInner({ onReturnToClient }) {
  const { isAdminAuthenticated, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B1220',
        position: 'relative'
      }}>
        <Background3D />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(56, 189, 248, 0.2)',
            borderTopColor: '#38BDF8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
          }} />
          <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>
            Verifying Administrator Credentials & Session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLoginPage onReturnToClient={onReturnToClient} />;
  }

  return <AdminLayout onReturnToClient={onReturnToClient} />;
}

export function AdminPortal({ onReturnToClient }) {
  return (
    <AdminProvider>
      <AdminPortalInner onReturnToClient={onReturnToClient} />
    </AdminProvider>
  );
}
