import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class AccessTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  accessToken: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresIn: Date;
}
