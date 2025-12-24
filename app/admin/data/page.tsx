'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  Tag,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Types
interface City {
  id: string;
  name: string;
  state: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Provider {
  id: string;
  businessName: string;
  city: string;
  state: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  phone?: string;
  website?: string;
}

type TabType = 'cities' | 'categories' | 'providers';

export default function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchAllData = async () => {
    if (!db) return;
    setLoading(true);

    try {
      // Fetch Cities
      const citiesSnap = await getDocs(collection(db, 'cities'));
      const citiesData = citiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as City[];
      setCities(citiesData);

      // Fetch Categories
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[];
      setCategories(categoriesData);

      // Fetch Providers
      const providersSnap = await getDocs(collection(db, 'providers'));
      const providersData = providersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Provider[];
      setProviders(providersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(getEmptyFormData());
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const getEmptyFormData = () => {
    switch (activeTab) {
      case 'cities':
        return { name: '', state: '' };
      case 'categories':
        return { name: '', icon: '', description: '' };
      case 'providers':
        return { businessName: '', city: '', state: '', categories: [], rating: 0, reviewCount: 0, verified: false, phone: '', website: '' };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);

    try {
      const collectionName = activeTab;
      
      if (editingItem) {
        // Update
        const docRef = doc(db, collectionName, editingItem.id);
        const { id, ...updateData } = formData;
        await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
        setMessage({ type: 'success', text: `${activeTab.slice(0, -1)} updated successfully` });
      } else {
        // Create
        await addDoc(collection(db, collectionName), { ...formData, createdAt: serverTimestamp() });
        setMessage({ type: 'success', text: `${activeTab.slice(0, -1)} added successfully` });
      }

      setShowModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this item?')) return;
    setSaving(true);

    try {
      await deleteDoc(doc(db, activeTab, id));
      setMessage({ type: 'success', text: `${activeTab.slice(0, -1)} deleted successfully` });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ type: 'error', text: 'Failed to delete' });
    } finally {
      setSaving(false);
    }
  };

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'cities':
        return cities.filter(c => c.name?.toLowerCase().includes(query) || c.state?.toLowerCase().includes(query));
      case 'categories':
        return categories.filter(c => c.name?.toLowerCase().includes(query));
      case 'providers':
        return providers.filter(p => p.businessName?.toLowerCase().includes(query) || p.city?.toLowerCase().includes(query));
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'cities' as TabType, label: 'Cities', icon: MapPin, count: cities.length },
    { id: 'categories' as TabType, label: 'Categories', icon: Tag, count: categories.length },
    { id: 'providers' as TabType, label: 'Providers', icon: Briefcase, count: providers.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
          <p className="text-gray-500 mt-1">Manage cities, categories, and providers</p>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-yellow-600 border-yellow-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {activeTab === 'cities' && (
                  <>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">City Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">State</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </>
                )}
                {activeTab === 'categories' && (
                  <>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Icon</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </>
                )}
                {activeTab === 'providers' && (
                  <>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Business Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Location</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Categories</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Rating</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredData().length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No {activeTab} found. Click &quot;Add {activeTab.slice(0, -1)}&quot; to create one.
                  </td>
                </tr>
              ) : (
                getFilteredData().map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'cities' && (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.state}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'categories' && (
                      <>
                        <td className="px-6 py-4">
                          <span className="text-2xl">{item.icon}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.description}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'providers' && (
                      <>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{item.businessName}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.city}, {item.state}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(item.categories || []).slice(0, 2).map((cat: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {cat}
                              </span>
                            ))}
                            {(item.categories || []).length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                +{item.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-600 font-medium">★ {item.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-400 text-sm ml-1">({item.reviewCount || 0})</span>
                        </td>
                        <td className="px-6 py-4">
                          {item.verified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Verified</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'cities' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Sydney"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., NSW"
                    />
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Dentist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji) *</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., 🦷"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Dental care & oral health"
                    />
                  </div>
                </>
              )}

              {activeTab === 'providers' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <input
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Sydney Dental Clinic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="e.g., Sydney"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="e.g., NSW"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
                    <input
                      type="text"
                      value={(formData.categories || []).join(', ')}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Dentist, Orthodontics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="e.g., +61 2 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="text"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="e.g., https://example.com"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={formData.verified || false}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="verified" className="text-sm text-gray-700">Verified Provider</label>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

