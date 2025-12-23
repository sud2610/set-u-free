'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  MoreVertical,
  Search,
  FileText,
} from 'lucide-react';

export default function ServicesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect customers
  if (user?.role !== 'provider') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">This page is only available for service providers.</p>
        <Link href="/dashboard" className="text-yellow-600 hover:text-yellow-700 mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Mock services data
  const services = [
    {
      id: 1,
      name: 'Dental Checkup',
      description: 'Comprehensive dental examination and cleaning',
      duration: 30,
      price: 150,
      status: 'active',
      bookings: 45,
    },
    {
      id: 2,
      name: 'Teeth Whitening',
      description: 'Professional teeth whitening treatment',
      duration: 60,
      price: 350,
      status: 'active',
      bookings: 23,
    },
    {
      id: 3,
      name: 'Root Canal Treatment',
      description: 'Complete root canal procedure with follow-up',
      duration: 90,
      price: 800,
      status: 'active',
      bookings: 12,
    },
    {
      id: 4,
      name: 'Dental Implant Consultation',
      description: 'Initial consultation for dental implants',
      duration: 45,
      price: 0,
      status: 'inactive',
      bookings: 8,
    },
  ];

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-500 mt-1">Manage the services you offer to customers</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    Service
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    Bookings
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        {service.price === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            {service.price}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{service.bookings}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          service.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Add your first service to start accepting bookings'}
          </p>
          {!searchQuery && (
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              Add Your First Service
            </button>
          )}
        </div>
      )}
    </div>
  );
}

