import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';

const dateColumnType: 'timestamp' | 'datetime' = process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp';

@Entity()
@Index(['token'])
@Index(['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: dateColumnType })
  expiresAt!: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ default: false })
  isRevoked!: boolean;

  @Column({ type: dateColumnType, nullable: true })
  revokedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Méthode helper pour vérifier si le token est valide
  isValid(): boolean {
    if (this.isRevoked) {
      return false;
    }
    
    return this.expiresAt > new Date();
  }

  // Méthode helper pour révoquer le token
  revoke(): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
  }
}
