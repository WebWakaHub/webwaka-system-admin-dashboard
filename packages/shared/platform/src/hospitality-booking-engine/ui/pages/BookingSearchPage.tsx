/**
 * Hospitality Booking Engine - Booking Search Page
 * 
 * Main page for searching available rooms and properties.
 * Mobile-first, responsive design with offline support.
 * 
 * @module hospitality-booking-engine/ui/pages/BookingSearchPage
 * @author webwakaagent4
 */

import React, { useState } from 'react';
import { SearchForm } from '../components/SearchForm';
import { SearchResults } from '../components/SearchResults';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useBookingSearch } from '../hooks/useBookingSearch';
import type { AvailabilitySearchRequest } from '../../types';

/**
 * Booking Search Page Component
 */
export const BookingSearchPage: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { searchResults, isLoading, error, searchAvailability } = useBookingSearch();
  const [searchParams, setSearchParams] = useState<AvailabilitySearchRequest | null>(null);

  const handleSearch = async (params: AvailabilitySearchRequest) => {
    setSearchParams(params);
    await searchAvailability(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Stay</h1>
          {!isOnline && <OfflineIndicator />}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <SearchResults 
            results={searchResults} 
            searchParams={searchParams}
            isLoading={isLoading}
          />
        )}

        {/* Empty State */}
        {!searchResults && !isLoading && !error && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No search yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by searching for available rooms
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingSearchPage;
