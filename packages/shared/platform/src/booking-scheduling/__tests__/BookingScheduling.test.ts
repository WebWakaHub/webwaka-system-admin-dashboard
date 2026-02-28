import { BookingScheduling } from '../BookingScheduling';
describe('BookingScheduling', () => {
  it('should create appointment', async () => {
    const booking = new BookingScheduling({ database: {}, eventBus: { emit: jest.fn() } });
    const appt = await booking.appointmentService.createAppointment({ providerId: 'p1', clientId: 'c1' });
    expect(appt.status).toBe('confirmed');
  });
});
