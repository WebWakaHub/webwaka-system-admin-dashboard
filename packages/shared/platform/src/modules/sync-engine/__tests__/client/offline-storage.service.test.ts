/**
 * Offline Storage Service Tests
 */

import { OfflineStorageService } from '../../client/offline-storage.service';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  databases: jest.fn(),
};

(global as any).indexedDB = mockIndexedDB;

describe('OfflineStorageService', () => {
  let service: OfflineStorageService;
  let mockDB: any;
  let mockObjectStore: any;
  let mockTransaction: any;

  beforeEach(() => {
    service = new OfflineStorageService('test-db');

    // Setup mocks
    mockObjectStore = {
      get: jest.fn(),
      getAll: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      createIndex: jest.fn(),
      index: jest.fn(),
      openCursor: jest.fn(),
    };

    mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockObjectStore),
    };

    mockDB = {
      transaction: jest.fn().mockReturnValue(mockTransaction),
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(false),
      },
      createObjectStore: jest.fn().mockReturnValue(mockObjectStore),
    };
  });

  describe('initialize', () => {
    it('should initialize IndexedDB successfully', async () => {
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();

      // Simulate successful opening
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;

      expect(mockIndexedDB.open).toHaveBeenCalledWith('test-db', 1);
    });

    it('should handle initialization error', async () => {
      const mockRequest: any = {
        error: new Error('Failed to open database'),
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();

      // Simulate error
      setTimeout(() => {
        if (mockRequest.onerror) {
          mockRequest.onerror();
        }
      }, 0);

      await expect(initPromise).rejects.toEqual(mockRequest.error);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      // Initialize the service
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;
    });

    it('should get an item from storage', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockGetRequest: any = {
        result: { key: 'products:1', data: mockData },
        onerror: null,
        onsuccess: null,
      };

      mockObjectStore.get.mockReturnValue(mockGetRequest);

      const getPromise = service.get('products', '1');

      setTimeout(() => {
        if (mockGetRequest.onsuccess) {
          mockGetRequest.onsuccess();
        }
      }, 0);

      const result = await getPromise;

      expect(result).toEqual(mockData);
      expect(mockObjectStore.get).toHaveBeenCalledWith('products:1');
    });

    it('should return null when item not found', async () => {
      const mockGetRequest: any = {
        result: null,
        onerror: null,
        onsuccess: null,
      };

      mockObjectStore.get.mockReturnValue(mockGetRequest);

      const getPromise = service.get('products', '1');

      setTimeout(() => {
        if (mockGetRequest.onsuccess) {
          mockGetRequest.onsuccess();
        }
      }, 0);

      const result = await getPromise;

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    beforeEach(async () => {
      // Initialize the service
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;
    });

    it('should set an item in storage', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockPutRequest: any = {
        onerror: null,
        onsuccess: null,
      };

      mockObjectStore.put.mockReturnValue(mockPutRequest);

      const setPromise = service.set('products', '1', mockData);

      setTimeout(() => {
        if (mockPutRequest.onsuccess) {
          mockPutRequest.onsuccess();
        }
      }, 0);

      await setPromise;

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'products:1',
          entity: 'products',
          id: '1',
          data: mockData,
        })
      );
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      // Initialize the service
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;
    });

    it('should delete an item from storage', async () => {
      const mockDeleteRequest: any = {
        onerror: null,
        onsuccess: null,
      };

      mockObjectStore.delete.mockReturnValue(mockDeleteRequest);

      const deletePromise = service.delete('products', '1');

      setTimeout(() => {
        if (mockDeleteRequest.onsuccess) {
          mockDeleteRequest.onsuccess();
        }
      }, 0);

      await deletePromise;

      expect(mockObjectStore.delete).toHaveBeenCalledWith('products:1');
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;
    });

    it('should get all items of an entity type', async () => {
      const mockData = [
        { key: 'products:1', entity: 'products', id: '1', data: { name: 'Product 1' } },
        { key: 'products:2', entity: 'products', id: '2', data: { name: 'Product 2' } },
      ];
      const mockGetAllRequest: any = {
        result: mockData,
        onerror: null,
        onsuccess: null,
      };

      const mockIndex = {
        getAll: jest.fn().mockReturnValue(mockGetAllRequest),
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      const getAllPromise = service.getAll('products');

      setTimeout(() => {
        if (mockGetAllRequest.onsuccess) {
          mockGetAllRequest.onsuccess();
        }
      }, 0);

      const result = await getAllPromise;

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Product 1' });
      expect(result[1]).toEqual({ name: 'Product 2' });
    });

    it('should return empty array when no items found', async () => {
      const mockGetAllRequest: any = {
        result: [],
        onerror: null,
        onsuccess: null,
      };

      const mockIndex = {
        getAll: jest.fn().mockReturnValue(mockGetAllRequest),
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      const getAllPromise = service.getAll('products');

      setTimeout(() => {
        if (mockGetAllRequest.onsuccess) {
          mockGetAllRequest.onsuccess();
        }
      }, 0);

      const result = await getAllPromise;

      expect(result).toEqual([]);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      const mockRequest: any = {
        result: mockDB,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = service.initialize();
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest });
        }
      }, 0);

      await initPromise;
    });

    it('should clear all items of an entity type', async () => {
      const mockCursor = {
        delete: jest.fn(),
        continue: jest.fn(),
      };

      const mockOpenCursorRequest: any = {
        onerror: null,
        onsuccess: null,
      };

      const mockIndex = {
        openCursor: jest.fn().mockReturnValue(mockOpenCursorRequest),
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      const clearPromise = service.clear('products');

      // Simulate cursor iteration
      setTimeout(() => {
        if (mockOpenCursorRequest.onsuccess) {
          // First call: cursor with data
          (mockOpenCursorRequest as any).result = mockCursor;
          mockOpenCursorRequest.onsuccess({ target: mockOpenCursorRequest });

          // Second call: no more data
          setTimeout(() => {
            (mockOpenCursorRequest as any).result = null;
            mockOpenCursorRequest.onsuccess({ target: mockOpenCursorRequest });
          }, 0);
        }
      }, 0);

      await clearPromise;

      expect(mockCursor.delete).toHaveBeenCalled();
      expect(mockCursor.continue).toHaveBeenCalled();
    });
  });
});
