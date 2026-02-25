import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [addingUser, setAddingUser] = useState(false);
  const { getAllUsers, createUser, deleteUser, updateUserRole, isAdmin, currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    
    if (!newUserEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setAddingUser(true);
      await createUser(newUserEmail, newUserRole);
      toast.success(`User added! Password reset email sent to ${newUserEmail}`);
      setNewUserEmail('');
      setNewUserRole('user');
      setShowAddUser(false);
      await loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered');
      } else {
        toast.error('Failed to add user');
      }
    } finally {
      setAddingUser(false);
    }
  }

  async function handleDeleteUser(userId, userEmail) {
    if (userId === currentUser.uid) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated');
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  }

  if (!isAdmin()) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--blue-dark)' }}>
          Access Denied
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--blue-dark)',
            letterSpacing: 1,
            marginBottom: 8
          }}>
            User Management
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-muted)'
          }}>
            Manage user access to the Condition Monitoring Portal
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          style={{
            padding: '12px 24px',
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#fff',
            background: 'var(--blue)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--blue-dark)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--blue)'}
        >
          {showAddUser ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div style={{
          background: '#fff',
          border: '1.5px solid rgba(0,117,190,0.2)',
          borderRadius: 8,
          padding: 32,
          marginBottom: 32,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--blue-dark)',
            marginBottom: 20
          }}>
            Add New User
          </h3>
          <form onSubmit={handleAddUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--blue-dark)',
                  marginBottom: 8
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={addingUser}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    border: '1.5px solid rgba(0,117,190,0.2)',
                    borderRadius: 6,
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--blue-dark)',
                  marginBottom: 8
                }}>
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  disabled={addingUser}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    border: '1.5px solid rgba(0,117,190,0.2)',
                    borderRadius: 6,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={addingUser}
              style={{
                padding: '12px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                color: '#fff',
                background: addingUser ? 'var(--text-muted)' : 'var(--blue)',
                border: 'none',
                borderRadius: 6,
                cursor: addingUser ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {addingUser ? 'Adding User...' : 'Add User & Send Invitation'}
            </button>
          </form>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 16
          }}>
            ℹ️ The user will receive an email to set their password
          </p>
        </div>
      )}

      {/* Users List */}
      <div style={{
        background: '#fff',
        border: '1.5px solid rgba(0,117,190,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
              No users found
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--blue-tint)', borderBottom: '2px solid rgba(0,117,190,0.2)' }}>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--blue-dark)',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--blue-dark)',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Role
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--blue-dark)',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Created
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--blue-dark)',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.id}
                  style={{ 
                    borderBottom: index < users.length - 1 ? '1px solid rgba(0,117,190,0.1)' : 'none',
                    background: user.id === currentUser.uid ? 'rgba(0,117,190,0.03)' : 'transparent'
                  }}
                >
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'var(--text-body)'
                  }}>
                    {user.email}
                    {user.id === currentUser.uid && (
                      <span style={{
                        marginLeft: 8,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--blue)',
                        background: 'var(--blue-tint)',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>
                        YOU
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUser.uid}
                      style={{
                        padding: '6px 12px',
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        border: '1.5px solid rgba(0,117,190,0.2)',
                        borderRadius: 4,
                        outline: 'none',
                        cursor: user.id === currentUser.uid ? 'not-allowed' : 'pointer',
                        background: user.role === 'admin' ? 'var(--blue-tint)' : '#fff',
                        color: user.role === 'admin' ? 'var(--blue-dark)' : 'var(--text-body)'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-muted)'
                  }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={user.id === currentUser.uid}
                      style={{
                        padding: '8px 16px',
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        color: user.id === currentUser.uid ? 'var(--text-muted)' : '#dc2626',
                        background: 'transparent',
                        border: `1.5px solid ${user.id === currentUser.uid ? 'var(--text-muted)' : '#dc2626'}`,
                        borderRadius: 4,
                        cursor: user.id === currentUser.uid ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (user.id !== currentUser.uid) {
                          e.target.style.background = '#dc2626';
                          e.target.style.color = '#fff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (user.id !== currentUser.uid) {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#dc2626';
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
