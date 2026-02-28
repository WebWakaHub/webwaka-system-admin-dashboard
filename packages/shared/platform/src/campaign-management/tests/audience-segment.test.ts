import { AudienceSegment } from '../models/audience-segment';

describe('AudienceSegment Model', () => {
  describe('Segment Creation', () => {
    it('should create a segment with valid data', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Active Users',
        criteria: {
          demographic: { age: '18-65' },
          behavioral: { previousEngagement: true },
        },
      });

      expect(segment.id).toBeDefined();
      expect(segment.name).toBe('Active Users');
      expect(segment.isDynamic).toBe(false);
    });

    it('should validate required fields', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
      });

      const errors = segment.validate();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Segment name is required');
    });

    it('should require at least one criterion', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Test Segment',
        criteria: {},
      });

      const errors = segment.validate();
      expect(errors).toContain('At least one segmentation criterion is required');
    });
  });

  describe('Segment Criteria Matching', () => {
    it('should match contact with demographic criteria', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Young Adults',
        criteria: {
          demographic: { age: '18-35', location: 'Lagos' },
        },
      });

      const contact = {
        id: 'contact-123',
        age: '18-35',
        location: 'Lagos',
      };

      expect(segment.matchesCriteria(contact)).toBe(true);
    });

    it('should not match contact with mismatched demographic criteria', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Young Adults',
        criteria: {
          demographic: { age: '18-35' },
        },
      });

      const contact = {
        id: 'contact-123',
        age: '50-65',
      };

      expect(segment.matchesCriteria(contact)).toBe(false);
    });

    it('should match contact with array criteria', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Multiple Locations',
        criteria: {
          demographic: { location: ['Lagos', 'Abuja', 'Port Harcourt'] },
        },
      });

      const contact = {
        id: 'contact-123',
        location: 'Abuja',
      };

      expect(segment.matchesCriteria(contact)).toBe(true);
    });

    it('should match contact with behavioral criteria', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Engaged Users',
        criteria: {
          behavioral: { previousEngagement: true, purchaseHistory: true },
        },
      });

      const contact = {
        id: 'contact-123',
        previousEngagement: true,
        purchaseHistory: true,
      };

      expect(segment.matchesCriteria(contact)).toBe(true);
    });

    it('should match contact with geographic criteria', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Nigeria',
        criteria: {
          geographic: { country: 'Nigeria' },
        },
      });

      const contact = {
        id: 'contact-123',
        country: 'Nigeria',
      };

      expect(segment.matchesCriteria(contact)).toBe(true);
    });

    it('should match contact with multiple criteria types', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Premium Users',
        criteria: {
          demographic: { age: '25-55' },
          behavioral: { purchaseHistory: true },
          geographic: { country: 'Nigeria' },
        },
      });

      const contact = {
        id: 'contact-123',
        age: '25-55',
        purchaseHistory: true,
        country: 'Nigeria',
      };

      expect(segment.matchesCriteria(contact)).toBe(true);
    });

    it('should not match if any criterion fails', () => {
      const segment = new AudienceSegment({
        tenantId: 'tenant-123',
        name: 'Premium Users',
        criteria: {
          demographic: { age: '25-55' },
          behavioral: { purchaseHistory: true },
        },
      });

      const contact = {
        id: 'contact-123',
        age: '25-55',
        purchaseHistory: false,
      };

      expect(segment.matchesCriteria(contact)).toBe(false);
    });
  });
});
