import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Users
} from 'lucide-react';

export function AdminNotificationsView() {
  const { broadcastAnnouncement, usersList } = useAdmin();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('info'); // 'info' | 'warning' | 'critical'
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSending(true);
    setFeedback(null);

    try {
      const res = await broadcastAnnouncement({
        title,
        description,
        severity
      });
      setFeedback({
        type: 'success',
        message: `Announcement successfully broadcast to ${res?.deliveredCount || usersList.length} active users!`
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Failed to broadcast announcement.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px 0' }}>
          Broadcast Platform Notifications
        </h2>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
          Send high-priority system announcements, tax alerts, or maintenance notices directly to all user dashboards.
        </p>
      </div>

      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          borderRadius: 12,
          padding: '12px 16px',
          color: feedback.type === 'success' ? '#34D399' : '#FCA5A5',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Broadcast Form Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.68)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)'
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Maintenance Window • Q4 Tax Planning Alert"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(11, 18, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#F8FAFC',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
              Announcement Message
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details for users..."
              rows={4}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(11, 18, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#F8FAFC',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
              Urgency / Severity Level
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'info', label: 'Informational', color: '#38BDF8' },
                { id: 'warning', label: 'Important Notice', color: '#F59E0B' },
                { id: 'critical', label: 'Critical Alert', color: '#EF4444' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeverity(opt.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${severity === opt.id ? opt.color : 'rgba(255, 255, 255, 0.1)'}`,
                    background: severity === opt.id ? `${opt.color}22` : 'rgba(11, 18, 32, 0.6)',
                    color: severity === opt.id ? opt.color : '#94A3B8',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              padding: '12px 20px',
              marginTop: 8,
              background: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 100%)',
              border: 'none',
              borderRadius: 10,
              color: '#FFFFFF',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(56, 189, 248, 0.3)',
              alignSelf: 'flex-start'
            }}
          >
            <Send size={16} />
            <span>{sending ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
