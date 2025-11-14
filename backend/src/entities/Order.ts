import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Product)
  @JoinColumn()
  product!: Product;

  @Column()
  checkIn!: Date;

  @Column()
  checkOut!: Date;

  @Column('int')
  guests!: number;

  @Column('decimal')
  totalPrice!: number;

  @Column({ default: 'pending' })
  status!: string;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
