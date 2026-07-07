import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Live } from '../../live/entities/live.entity';

@Entity('media_users')
export class MediaUser {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  fullName: string;
  
  @Column()
  role: string;
  
  @Column({ nullable: true })
  profilePhotoUrl: string;
  
  @OneToMany(() => Live, (live) => live.creator)
  lives: Live[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}