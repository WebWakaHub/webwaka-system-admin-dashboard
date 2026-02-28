import { DataSource, Repository } from 'typeorm';
import { Attendance } from '../models/Attendance';

export class AttendanceRepository {
  private repository: Repository<Attendance>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Attendance);
  }

  async create(data: Partial<Attendance>): Promise<Attendance> {
    const attendance = this.repository.create(data);
    return await this.repository.save(attendance);
  }

  async findById(attendanceId: string): Promise<Attendance | null> {
    return await this.repository.findOne({ where: { attendanceId } });
  }

  async findByEventAndMember(eventId: string, memberId: string): Promise<Attendance | null> {
    return await this.repository.findOne({ where: { eventId, memberId } });
  }

  async findByEventId(eventId: string): Promise<Attendance[]> {
    return await this.repository.find({
      where: { eventId },
      order: { checkInTime: 'ASC' },
    });
  }

  async findByMemberId(memberId: string): Promise<Attendance[]> {
    return await this.repository.find({
      where: { memberId },
      order: { checkInTime: 'DESC' },
    });
  }

  async countByEvent(eventId: string): Promise<number> {
    return await this.repository.count({ where: { eventId } });
  }

  async getAttendanceRate(eventId: string, totalRegistrations: number): Promise<number> {
    const attendanceCount = await this.countByEvent(eventId);
    if (totalRegistrations === 0) return 0;
    return (attendanceCount / totalRegistrations) * 100;
  }
}
