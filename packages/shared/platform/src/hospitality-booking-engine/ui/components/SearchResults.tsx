/**
 * Hospitality Booking Engine - Search Results Component
 * 
 * Displays search results with property cards.
 * 
 * @module hospitality-booking-engine/ui/components/SearchResults
 * @author webwakaagent4
 */

import React from 'react';
import type { AvailabilitySearchResponse, AvailabilitySearchRequest } from '../../types';

interface SearchResultsProps {
  results: AvailabilitySearchResponse;
  searchParams: AvailabilitySearchRequest | null;
  isLoading: boolean;
}

/**
 * Search Results Component
 */
export const SearchResults: React.FC<SearchResultsProps> = ({ results, searchParams, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Searching available rooms...</p>
      </div>
    );
  }

  if (results.properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search criteria or dates
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {results.pagination.totalItems} {results.pagination.totalItems === 1 ? 'Property' : 'Properties'} Found
        </h2>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.properties.map((property) => (
          <div key={property.propertyId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image */}
            <div className="h-48 bg-gray-200">
              {property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.propertyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {property.propertyName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{property.location}</p>
              <div className="flex items-center mb-3">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm text-gray-700">{property.rating.toFixed(1)}</span>
              </div>

              {/* Room Types */}
              <div className="space-y-2">
                {property.roomTypes.slice(0, 2).map((roomType) => (
                  <div key={roomType.roomTypeId} className="text-sm">
                    <p className="font-medium text-gray-900">{roomType.roomTypeName}</p>
                    <p className="text-gray-600">
                      {roomType.availableRooms} room{roomType.availableRooms !== 1 ? 's' : ''} available
                    </p>
                  </div>
                ))}
              </div>

              {/* Book Button */}
              <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {results.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {results.pagination.page} of {results.pagination.totalPages}
            </span>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
