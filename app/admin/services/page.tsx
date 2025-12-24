'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Clock,
  Image as ImageIcon,
  Tag,
  Briefcase,
  Edit,
  Plus,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import type { Service, Provider } from '@/types';
import Image from 'next/image';

interface ServiceWithProvider extends Service {
  provider?: Provider;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceWithProvider | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 12;

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, categoryFilter]);

  const fetchServices = async () => {
    if (!db) return;
    const firestore = db;

    try {
      const servicesQuery = query(collection(firestore, 'services'), orderBy('createdAt', 'desc'));
      const servicesSnapshot = await getDocs(servicesQuery);
      
      const allCategories = new Set<string>();
      
      const servicesData = await Promise.all(
        servicesSnapshot.docs.map(async (serviceDoc) => {
          const data = serviceDoc.data();
          
          // Track category
          if (data.category) {
            allCategories.add(data.category);
          }
          
          // Get provider data
          let provider: Provider | undefined;
          if (data.providerId) {
            try {
              const providerDoc = await getDoc(doc(firestore, 'providers', data.providerId));
              if (providerDoc.exists()) {
                const providerData = providerDoc.data();
                provider = {
                  uid: providerDoc.id,
                  ...providerData,
                  createdAt: providerData.createdAt?.toDate() || new Date(),
                  updatedAt: providerData.updatedAt?.toDate() || new Date(),
                } as Provider;
              }
            } catch (e) {
              console.error('Error fetching provider:', e);
            }
          }

          return {
            id: serviceDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            provider,
          } as ServiceWithProvider;
        })
      );

      setServices(servicesData);
      setCategories(Array.from(allCategories).sort());
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.provider?.businessName?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    setFilteredServices(filtered);
    setCurrentPage(1);
  };

  const deleteService = async (service: ServiceWithProvider) => {
    if (!db || !confirm(`Are you sure you want to delete "${service.title}"? This action cannot be undone.`)) return;
    const firestore = db;
    setActionLoading(service.id);

    try {
      await deleteDoc(doc(firestore, 'services', service.id));
      setServices(prev => prev.filter(s => s.id !== service.id));
      setShowServiceModal(false);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + servicesPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Management</h1>
          <p className="text-slate-400 mt-1">View and manage all services on the platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Package className="w-4 h-4" />
          {services.length} total services
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{services.length}</p>
              <p className="text-slate-400 text-sm">Total Services</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
              <p className="text-slate-400 text-sm">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {new Set(services.map(s => s.providerId)).size}
              </p>
              <p className="text-slate-400 text-sm">Providers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(services.reduce((acc, s) => acc + (s.duration || 0), 0) / services.length || 0)}
              </p>
              <p className="text-slate-400 text-sm">Avg Duration (min)</p>
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
              placeholder="Search by title, description, provider, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedServices.length === 0 ? (
          <div className="col-span-full bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No services found matching your criteria</p>
          </div>
        ) : (
          paginatedServices.map((service) => (
            <div
              key={service.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group"
            >
              {/* Service Image */}
              <div className="relative h-40 bg-slate-700">
                {service.images && service.images[0] ? (
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-600" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                    {service.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowServiceModal(true);
                    }}
                    className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold line-clamp-1">{service.title}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.provider?.profileImage ? (
                      <Image
                        src={service.provider.profileImage}
                        alt={service.provider.businessName}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Briefcase className="w-3 h-3 text-purple-400" />
                      </div>
                    )}
                    <span className="text-slate-400 text-sm truncate max-w-[100px]">
                      {service.provider?.businessName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => deleteService(service)}
                  disabled={actionLoading === service.id}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === service.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Service
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
            Showing {startIndex + 1} to {Math.min(startIndex + servicesPerPage, filteredServices.length)} of {filteredServices.length} services
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
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

      {/* Service Detail Modal */}
      {showServiceModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Service Image */}
            <div className="relative h-64 bg-slate-700">
              {selectedService.images && selectedService.images[0] ? (
                <Image
                  src={selectedService.images[0]}
                  alt={selectedService.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-slate-600" />
                </div>
              )}
              <button
                onClick={() => setShowServiceModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Clock className="w-5 h-5 text-white rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title & Category */}
              <div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium">
                  {selectedService.category}
                </span>
                <h2 className="text-2xl font-bold text-white mt-3">{selectedService.title}</h2>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-slate-300">{selectedService.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Duration</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {selectedService.duration} minutes
                  </p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Created</p>
                  <p className="text-white font-medium">
                    {selectedService.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Provider */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Provider</h3>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl">
                  {selectedService.provider?.profileImage ? (
                    <Image
                      src={selectedService.provider.profileImage}
                      alt={selectedService.provider.businessName}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedService.provider?.businessName || 'Unknown'}</p>
                    <p className="text-slate-400 text-sm">{selectedService.provider?.city}, {selectedService.provider?.location}</p>
                  </div>
                </div>
              </div>

              {/* All Images */}
              {selectedService.images && selectedService.images.length > 1 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">All Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedService.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-700">
                        <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowServiceModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => deleteService(selectedService)}
                disabled={actionLoading === selectedService.id}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === selectedService.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

