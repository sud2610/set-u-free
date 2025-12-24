'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShieldOff,
  Trash2,
  Edit,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Briefcase,
  User as UserIcon,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import type { User } from '@/types';
import Image from 'next/image';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'provider' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    if (!db) return;

    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as User;
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive !== false : user.isActive === false
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const toggleUserStatus = async (user: User) => {
    if (!db) return;
    setActionLoading(user.uid);

    try {
      const userRef = doc(db, 'users', user.uid);
      const newStatus = user.isActive === false ? true : false;
      await updateDoc(userRef, { isActive: newStatus });
      
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, isActive: newStatus } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (user: User) => {
    if (!db || !confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) return;
    setActionLoading(user.uid);

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      setUsers(prev => prev.filter(u => u.uid !== user.uid));
      setShowUserModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      provider: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      customer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[role] || colors.customer;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'provider': return Briefcase;
      default: return UserIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all users on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Location</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.uid} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              alt={user.fullName}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-900">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{user.fullName}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadge(user.role)}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-slate-300 text-sm flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-sm flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {user.location || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive === false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            <UserX className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">
                          {user.createdAt.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            disabled={actionLoading === user.uid}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                            title={user.isActive === false ? 'Activate user' : 'Deactivate user'}
                          >
                            {actionLoading === user.uid ? (
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : user.isActive === false ? (
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-amber-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={actionLoading === user.uid || user.role === 'admin'}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-amber-500 text-slate-900'
                      : 'hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selectedUser.profileImage ? (
                    <Image
                      src={selectedUser.profileImage}
                      alt={selectedUser.fullName}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">
                        {selectedUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.fullName}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-lg text-xs font-medium border ${getRoleBadge(selectedUser.role)}`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400 rotate-90" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Phone</p>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Location</p>
                  <p className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {selectedUser.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Joined</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {selectedUser.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Status</p>
                {selectedUser.isActive === false ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    <UserX className="w-4 h-4" />
                    Inactive - This user is deactivated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <UserCheck className="w-4 h-4" />
                    Active - User can access the platform
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => toggleUserStatus(selectedUser)}
                disabled={actionLoading === selectedUser.uid}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                  selectedUser.isActive === false
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                }`}
              >
                {actionLoading === selectedUser.uid ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : selectedUser.isActive === false ? (
                  'Activate User'
                ) : (
                  'Deactivate User'
                )}
              </button>
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => deleteUser(selectedUser)}
                  disabled={actionLoading === selectedUser.uid}
                  className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

