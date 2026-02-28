/**
 * Hospitality Booking Engine - useBookingSearch Hook
 * 
 * React hook for booking search with API integration.
 * 
 * @module hospitality-booking-engine/ui/hooks/useBookingSearch
 * @author webwakaagent4
 */

import { useState } from 'react';
import { bookingApiClient } from '../services/booking-api-client';
import type { AvailabilitySearchRequest, AvailabilitySearchResponse } from '../../types';

interface UseBookingSearchResult {
  searchResults: AvailabilitySearchResponse | null;
  isLoading: boolean;
  error: string | null;
  searchAvailability: (params: AvailabilitySearchRequest) => Promise<void>;
}

/**
 * useBookingSearch Hook
 * 
 * Manages booking search state and API calls.
 * 
 * @returns {UseBookingSearchResult} Search state and methods
 */
export function useBookingSearch(): UseBookingSearchResult {
  const [searchResults, setSearchResults] = useState<AvailabilitySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchAvailability = async (params: AvailabilitySearchRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await bookingApiClient.searchAvailability(params);
      setSearchResults(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search availability. Please try again.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResults,
    isLoading,
    error,
    searchAvailability,
  };
}

export default useBookingSearch;
