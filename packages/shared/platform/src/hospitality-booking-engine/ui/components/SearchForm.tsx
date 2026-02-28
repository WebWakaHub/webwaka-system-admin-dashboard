/**
 * Hospitality Booking Engine - Search Form Component
 * 
 * Form for searching available rooms with validation.
 * Mobile-first, touch-friendly design.
 * 
 * @module hospitality-booking-engine/ui/components/SearchForm
 * @author webwakaagent4
 */

import React, { useState } from 'react';
import type { AvailabilitySearchRequest } from '../../types';

interface SearchFormProps {
  onSearch: (params: AvailabilitySearchRequest) => void;
  isLoading: boolean;
}

/**
 * Search Form Component
 */
export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }

    if (checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)) {
      newErrors.checkOutDate = 'Check-out must be after check-in';
    }

    if (adultsCount < 1) {
      newErrors.adultsCount = 'At least one adult is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSearch({
      tenantId: '', // Will be set by API from JWT token
      checkInDate,
      checkOutDate,
      adultsCount,
      childrenCount,
      page: 1,
      pageSize: 20,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Check-in and Check-out Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check-in Date */}
        <div>
          <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            id="checkInDate"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.checkInDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkInDate && (
            <p className="mt-1 text-sm text-red-600">{errors.checkInDate}</p>
          )}
        </div>

        {/* Check-out Date */}
        <div>
          <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            id="checkOutDate"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkOutDate && (
            <p className="mt-1 text-sm text-red-600">{errors.checkOutDate}</p>
          )}
        </div>
      </div>

      {/* Guests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Adults Count */}
        <div>
          <label htmlFor="adultsCount" className="block text-sm font-medium text-gray-700 mb-1">
            Adults
          </label>
          <select
            id="adultsCount"
            value={adultsCount}
            onChange={(e) => setAdultsCount(Number(e.target.value))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adultsCount ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'Adult' : 'Adults'}
              </option>
            ))}
          </select>
          {errors.adultsCount && (
            <p className="mt-1 text-sm text-red-600">{errors.adultsCount}</p>
          )}
        </div>

        {/* Children Count */}
        <div>
          <label htmlFor="childrenCount" className="block text-sm font-medium text-gray-700 mb-1">
            Children
          </label>
          <select
            id="childrenCount"
            value={childrenCount}
            onChange={(e) => setChildrenCount(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[0, 1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'Child' : 'Children'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Searching...' : 'Search Available Rooms'}
      </button>
    </form>
  );
};

export default SearchForm;
