import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  refreshToken: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresIn: Date;

  @Column({ nullable: true })
  ipAddress: string; // need to add

  @Column({ nullable: true })
  userAgent: string; // need to add
  affected: number;
}
