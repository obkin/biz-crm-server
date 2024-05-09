import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  refreshToken: string;

  @Column()
  userId: number;

  @Column()
  expiresIn: Date;

  @Column({ nullable: true })
  ipAddress: string; // IP-адреса користувача

  @Column({ nullable: true })
  userAgent: string; // Інформація про браузер користувача
}
