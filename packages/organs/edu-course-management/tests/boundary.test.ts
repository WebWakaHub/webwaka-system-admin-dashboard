/**
 * CourseManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-EDU-COURSE_MANAGEMENT
 */

import { CourseManagementOrgan } from '../src/CourseManagementOrgan';

describe('CourseManagement Domain Boundary', () => {
  it('should enforce organ boundary for Education and Learning', () => {
    const organ = new CourseManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EDU-COURSE_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-EDU/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new CourseManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-137510d8' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EDU-COURSE_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EDU-COURSE_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('CourseManagement');
  });
});
