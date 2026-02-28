/**
 * Hospitality Booking Engine - useOnlineStatus Hook
 * 
 * React hook for detecting online/offline status.
 * 
 * @module hospitality-booking-engine/ui/hooks/useOnlineStatus
 * @author webwakaagent4
 */

import { useState, useEffect } from 'react';

/**
 * useOnlineStatus Hook
 * 
 * Tracks browser online/offline status and returns current state.
 * 
 * @returns {boolean} True if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Network status: Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
