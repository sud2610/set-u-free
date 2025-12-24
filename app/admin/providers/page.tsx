'use client';

import { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldX,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
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
  getDoc,
} from 'firebase/firestore';
import type { Provider, User, Service } from '@/types';
import Image from 'next/image';

interface ProviderWithUser extends Provider {
  user?: User;
  servicesCount?: number;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderWithUser[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithUser | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 10;

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, verificationFilter]);

  const fetchProviders = async () => {
    if (!db) return;
    const firestore = db;

    try {
      // Fetch providers
      const providersQuery = query(collection(firestore, 'providers'), orderBy('createdAt', 'desc'));
      const providersSnapshot = await getDocs(providersQuery);
      
      // Fetch users and services for each provider
      const providersData = await Promise.all(
        providersSnapshot.docs.map(async (providerDoc) => {
          const data = providerDoc.data();
          const providerId = providerDoc.id;
          
          // Get user data
          let user: User | undefined;
          try {
            const userDoc = await getDoc(doc(firestore, 'users', providerId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              user = {
                uid: userDoc.id,
                ...userData,
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
              } as User;
            }
          } catch (e) {
            console.error('Error fetching user:', e);
          }

          // Get services count
          let servicesCount = 0;
          try {
            const servicesQuery = query(
              collection(firestore, 'services'),
            );
            const servicesSnapshot = await getDocs(servicesQuery);
            servicesCount = servicesSnapshot.docs.filter(
              s => s.data().providerId === providerId
            ).length;
          } catch (e) {
            console.error('Error fetching services count:', e);
          }

          return {
            uid: providerId,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            user,
            servicesCount,
          } as ProviderWithUser;
        })
      );

      setProviders(providersData);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.businessName?.toLowerCase().includes(query) ||
        provider.user?.fullName?.toLowerCase().includes(query) ||
        provider.user?.email?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.location?.toLowerCase().includes(query)
      );
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(provider => 
        verificationFilter === 'verified' ? provider.verified : !provider.verified
      );
    }

    setFilteredProviders(filtered);
    setCurrentPage(1);
  };

  const toggleVerification = async (provider: ProviderWithUser) => {
    if (!db) return;
    const firestore = db;
    setActionLoading(provider.uid);

    try {
      const providerRef = doc(firestore, 'providers', provider.uid);
      const newStatus = !provider.verified;
      await updateDoc(providerRef, { verified: newStatus });
      
      setProviders(prev => prev.map(p => 
        p.uid === provider.uid ? { ...p, verified: newStatus } : p
      ));

      if (selectedProvider?.uid === provider.uid) {
        setSelectedProvider({ ...selectedProvider, verified: newStatus });
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProvider = async (provider: ProviderWithUser) => {
    if (!db || !confirm(`Are you sure you want to delete ${provider.businessName}? This will also remove all their services and data.`)) return;
    const firestore = db;
    setActionLoading(provider.uid);

    try {
      // Delete provider document
      await deleteDoc(doc(firestore, 'providers', provider.uid));
      
      // Note: In production, you'd also want to delete associated services, bookings, etc.
      
      setProviders(prev => prev.filter(p => p.uid !== provider.uid));
      setShowProviderModal(false);
    } catch (error) {
      console.error('Error deleting provider:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);
  const startIndex = (currentPage - 1) * providersPerPage;
  const paginatedProviders = filteredProviders.slice(startIndex, startIndex + providersPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Provider Management</h1>
          <p className="text-slate-400 mt-1">Manage and verify service providers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-amber-400 text-sm font-medium">
              {providers.filter(p => !p.verified).length} Pending Verification
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{providers.length}</p>
              <p className="text-slate-400 text-sm">Total Providers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{providers.filter(p => p.verified).length}</p>
              <p className="text-slate-400 text-sm">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{providers.filter(p => !p.verified).length}</p>
              <p className="text-slate-400 text-sm">Pending</p>
            </div>
          </div>
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
              placeholder="Search by business name, owner, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Verification Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Providers</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedProviders.length === 0 ? (
          <div className="col-span-full bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No providers found matching your criteria</p>
          </div>
        ) : (
          paginatedProviders.map((provider) => (
            <div
              key={provider.uid}
              className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* Provider Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-start gap-3">
                  {provider.profileImage ? (
                    <Image
                      src={provider.profileImage}
                      alt={provider.businessName}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold truncate">{provider.businessName}</h3>
                      {provider.verified ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm truncate">{provider.user?.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{provider.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{provider.city || provider.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-medium">{provider.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-slate-500 text-sm">({provider.reviewCount || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">{provider.servicesCount || 0} services</span>
                  </div>
                </div>

                {/* Categories */}
                {provider.categories && provider.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {provider.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {cat}
                      </span>
                    ))}
                    {provider.categories.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                        +{provider.categories.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-700 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProvider(provider);
                    setShowProviderModal(true);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => toggleVerification(provider)}
                  disabled={actionLoading === provider.uid}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    provider.verified
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {actionLoading === provider.uid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : provider.verified ? (
                    <>
                      <ShieldX className="w-4 h-4" />
                      Revoke
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + providersPerPage, filteredProviders.length)} of {filteredProviders.length} providers
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

      {/* Provider Detail Modal */}
      {showProviderModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selectedProvider.profileImage ? (
                    <Image
                      src={selectedProvider.profileImage}
                      alt={selectedProvider.businessName}
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProvider.businessName}</h2>
                    <p className="text-slate-400">{selectedProvider.user?.fullName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedProvider.verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified Provider
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProviderModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedProvider.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                  <p className="text-white">{selectedProvider.description}</p>
                </div>
              )}

              {/* Bio */}
              {selectedProvider.bio && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Bio</h3>
                  <p className="text-slate-300">{selectedProvider.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-xl font-bold text-white">{selectedProvider.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Rating</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-white">{selectedProvider.reviewCount || 0}</p>
                  <p className="text-slate-400 text-sm">Reviews</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-white">{selectedProvider.servicesCount || 0}</p>
                  <p className="text-slate-400 text-sm">Services</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-white text-sm">{selectedProvider.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-white text-sm">{selectedProvider.user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl col-span-2">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="text-white text-sm">{selectedProvider.city}, {selectedProvider.location}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {selectedProvider.categories && selectedProvider.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-white">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Joined on {selectedProvider.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => toggleVerification(selectedProvider)}
                disabled={actionLoading === selectedProvider.uid}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  selectedProvider.verified
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {actionLoading === selectedProvider.uid ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : selectedProvider.verified ? (
                  <>
                    <ShieldX className="w-5 h-5" />
                    Revoke Verification
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Verify Provider
                  </>
                )}
              </button>
              <button
                onClick={() => deleteProvider(selectedProvider)}
                disabled={actionLoading === selectedProvider.uid}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

