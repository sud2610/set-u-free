'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';

// ==================== TYPES ====================

interface Suggestion {
  id: string;
  name: string;
  icon?: string;
}

// ==================== CONSTANTS ====================

const categoryOptions: Suggestion[] = [
  { id: 'dentist', name: 'Dentist', icon: '🦷' },
  { id: 'beauty', name: 'Beauty & Spa', icon: '💅' },
  { id: 'gym', name: 'Gym & Fitness', icon: '💪' },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏥' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
  { id: 'dermatology', name: 'Dermatology', icon: '✨' },
  { id: 'home-services', name: 'Home Services', icon: '🏠' },
  { id: 'education', name: 'Education', icon: '📚' },
];

const cityOptions: Suggestion[] = [
  { id: 'sydney', name: 'Sydney' },
  { id: 'melbourne', name: 'Melbourne' },
  { id: 'brisbane', name: 'Brisbane' },
  { id: 'perth', name: 'Perth' },
  { id: 'adelaide', name: 'Adelaide' },
  { id: 'gold-coast', name: 'Gold Coast' },
  { id: 'canberra', name: 'Canberra' },
  { id: 'newcastle', name: 'Newcastle' },
  { id: 'hobart', name: 'Hobart' },
  { id: 'darwin', name: 'Darwin' },
];

// ==================== AIRBNB-STYLE SEARCH BAR ====================

/**
 * Airbnb-style search bar component
 * Features:
 * - Pill-shaped design with sections
 * - Service search with dropdown
 * - Location/city input with dropdown
 * - When section (placeholder)
 * - Who section (placeholder)
 * - Pink/rose search button
 */
export function SearchBar() {
  // ==================== STATE ====================
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [serviceQuery, setServiceQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Suggestion | null>(null);
  const [selectedCity, setSelectedCity] = useState<Suggestion | null>(null);

  // ==================== REFS ====================
  const searchBarRef = useRef<HTMLDivElement>(null);
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // ==================== HOOKS ====================
  const router = useRouter();

  // ==================== EFFECTS ====================

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HANDLERS ====================

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedCategory) {
      params.set('category', selectedCategory.id);
    } else if (serviceQuery.trim()) {
      params.set('q', serviceQuery.trim());
    }
    
    if (selectedCity) {
      params.set('city', selectedCity.id);
    } else if (cityQuery.trim()) {
      params.set('city', cityQuery.trim().toLowerCase());
    }

    const searchPath = selectedCategory
      ? `/services/${selectedCategory.id}`
      : '/services';
    
    const queryString = params.toString();
    router.push(queryString ? `${searchPath}?${queryString}` : searchPath);
  };

  const handleCategorySelect = (category: Suggestion) => {
    setSelectedCategory(category);
    setServiceQuery(category.name);
    setActiveSection('location');
    cityInputRef.current?.focus();
  };

  const handleCitySelect = (city: Suggestion) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setActiveSection(null);
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
    if (section === 'service') {
      serviceInputRef.current?.focus();
    } else if (section === 'location') {
      cityInputRef.current?.focus();
    }
  };

  const clearServiceInput = () => {
    setServiceQuery('');
    setSelectedCategory(null);
  };

  const clearCityInput = () => {
    setCityQuery('');
    setSelectedCity(null);
  };

  // ==================== FILTERED OPTIONS ====================

  const filteredCategories = categoryOptions.filter((category) =>
    category.name.toLowerCase().includes(serviceQuery.toLowerCase())
  );

  const filteredCities = cityOptions.filter((city) =>
    city.name.toLowerCase().includes(cityQuery.toLowerCase())
  );

  // ==================== RENDER ====================

  return (
    <div ref={searchBarRef}>
      {/* ==================== SEARCH BAR PILL ==================== */}
      <div
        className={`relative flex items-center bg-white rounded-full border transition-all duration-300 ${
          activeSection
            ? 'shadow-2xl border-gray-200'
            : 'shadow-lg shadow-gray-200/50 border-gray-200 hover:shadow-xl'
        }`}
      >
        {/* Where Section */}
        <div
          className={`relative flex-1 min-w-0 cursor-pointer rounded-full transition-all ${
            activeSection === 'service'
              ? 'bg-white shadow-lg'
              : activeSection
              ? 'bg-gray-50 hover:bg-gray-100'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleSectionClick('service')}
        >
          <div className="px-6 py-4">
            <label className="block text-xs font-bold text-gray-900">Where</label>
            <div className="relative">
              <input
                ref={serviceInputRef}
                type="text"
                value={serviceQuery}
                onChange={(e) => {
                  setServiceQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                onFocus={() => setActiveSection('service')}
                placeholder="Search services"
                className="w-full text-sm text-gray-600 placeholder:text-gray-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
              {serviceQuery && activeSection === 'service' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearServiceInput();
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Service Dropdown */}
          {activeSection === 'service' && (
            <div className="absolute z-50 top-full left-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 max-h-80 overflow-y-auto">
              <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Popular Services
              </div>
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`w-px h-8 ${activeSection ? 'bg-transparent' : 'bg-gray-200'}`} />

        {/* When Section */}
        <div
          className={`relative cursor-pointer rounded-full transition-all ${
            activeSection === 'when'
              ? 'bg-white shadow-lg'
              : activeSection
              ? 'bg-gray-50 hover:bg-gray-100'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleSectionClick('when')}
        >
          <div className="px-6 py-4">
            <label className="block text-xs font-bold text-gray-900">When</label>
            <p className="text-sm text-gray-400">Add dates</p>
          </div>

          {/* When Dropdown - Placeholder */}
          {activeSection === 'when' && (
            <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                Date selection coming soon!
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`w-px h-8 ${activeSection ? 'bg-transparent' : 'bg-gray-200'}`} />

        {/* Who Section */}
        <div
          className={`relative cursor-pointer rounded-full transition-all ${
            activeSection === 'location'
              ? 'bg-white shadow-lg'
              : activeSection
              ? 'bg-gray-50 hover:bg-gray-100'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleSectionClick('location')}
        >
          <div className="px-6 py-4 pr-24">
            <label className="block text-xs font-bold text-gray-900">Location</label>
            <div className="relative">
              <input
                ref={cityInputRef}
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setSelectedCity(null);
                }}
                onFocus={() => setActiveSection('location')}
                placeholder="Add location"
                className="w-full text-sm text-gray-600 placeholder:text-gray-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
              {cityQuery && activeSection === 'location' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCityInput();
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Location Dropdown */}
          {activeSection === 'location' && (
            <div className="absolute z-50 top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 max-h-72 overflow-y-auto">
              <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Popular Destinations
              </div>
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-gray-900 font-medium">{city.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className={`absolute right-2 flex items-center justify-center transition-all duration-300 ${
            activeSection
              ? 'gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold rounded-full shadow-lg'
              : 'w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-full shadow-lg'
          }`}
        >
          <Search className={activeSection ? 'w-4 h-4' : 'w-5 h-5'} />
          {activeSection && <span>Search</span>}
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
