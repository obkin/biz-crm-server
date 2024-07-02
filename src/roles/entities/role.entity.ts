import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @ApiProperty({
    example: 2394,
    description: 'The unique identifier of the role',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'User',
    description: 'Name of the role',
  })
  @Column()
  name: string;
}
