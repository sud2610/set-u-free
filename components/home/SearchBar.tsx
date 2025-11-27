'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, X, Sparkles } from 'lucide-react';

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
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'delhi', name: 'Delhi' },
  { id: 'bangalore', name: 'Bangalore' },
  { id: 'hyderabad', name: 'Hyderabad' },
  { id: 'chennai', name: 'Chennai' },
  { id: 'kolkata', name: 'Kolkata' },
  { id: 'pune', name: 'Pune' },
  { id: 'ahmedabad', name: 'Ahmedabad' },
  { id: 'jaipur', name: 'Jaipur' },
  { id: 'lucknow', name: 'Lucknow' },
];

const popularSearches = ['Dentist', 'Yoga Classes', 'Personal Trainer', 'Nutritionist'];

// ==================== SEARCH BAR COMPONENT ====================

/**
 * Search bar component for the home page
 * Features:
 * - Service/category search input with dropdown suggestions
 * - Location/city input with dropdown suggestions
 * - Search button
 * - Integration with Next.js router
 * - Popular searches quick links
 * - Responsive design
 */
export function SearchBar() {
  // ==================== STATE ====================
  const [serviceQuery, setServiceQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Suggestion | null>(null);
  const [selectedCity, setSelectedCity] = useState<Suggestion | null>(null);

  // ==================== REFS ====================
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // ==================== HOOKS ====================
  const router = useRouter();

  // ==================== EFFECTS ====================

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node) &&
        !serviceInputRef.current?.contains(event.target as Node)
      ) {
        setShowServiceDropdown(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        !cityInputRef.current?.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HANDLERS ====================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setShowServiceDropdown(false);
  };

  const handleCitySelect = (city: Suggestion) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowCityDropdown(false);
  };

  const handleQuickSearch = (term: string) => {
    setServiceQuery(term);
    const category = categoryOptions.find(
      (c) => c.name.toLowerCase().includes(term.toLowerCase())
    );
    if (category) {
      setSelectedCategory(category);
    }
    router.push(`/services?q=${encodeURIComponent(term)}`);
  };

  const clearServiceInput = () => {
    setServiceQuery('');
    setSelectedCategory(null);
    serviceInputRef.current?.focus();
  };

  const clearCityInput = () => {
    setCityQuery('');
    setSelectedCity(null);
    cityInputRef.current?.focus();
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
    <div className="w-full max-w-4xl mx-auto">
      {/* ==================== SEARCH FORM ==================== */}
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Service/Category Input */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={serviceInputRef}
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => {
                    setServiceQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  onFocus={() => setShowServiceDropdown(true)}
                  placeholder="Search services (e.g., Dentist, Yoga)"
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-orange-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                {serviceQuery && (
                  <button
                    type="button"
                    onClick={clearServiceInput}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Service Dropdown */}
              {showServiceDropdown && filteredCategories.length > 0 && (
                <div
                  ref={serviceDropdownRef}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 max-h-72 overflow-y-auto"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </div>
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-gray-700 font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City Input */}
            <div className="relative sm:w-56">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={cityInputRef}
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setSelectedCity(null);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="City"
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-orange-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                {cityQuery ? (
                  <button
                    type="button"
                    onClick={clearCityInput}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>

              {/* City Dropdown */}
              {showCityDropdown && filteredCities.length > 0 && (
                <div
                  ref={cityDropdownRef}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 max-h-60 overflow-y-auto"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Popular Cities
                  </div>
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">{city.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* ==================== POPULAR SEARCHES ==================== */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <Sparkles className="w-4 h-4 text-orange-500" />
          Popular:
        </span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className="px-4 py-2 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-full text-sm text-gray-600 hover:text-orange-600 transition-all duration-200"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
