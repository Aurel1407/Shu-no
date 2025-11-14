import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PricePeriod } from './PricePeriod';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('float')
  price!: number;

  @Column()
  location!: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  region?: string;

  @Column('int')
  maxGuests!: number;

  @Column('json', { nullable: true })
  amenities?: string[];

  @Column('json', { nullable: true })
  images?: string[];

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => PricePeriod, pricePeriod => pricePeriod.product, { cascade: true })
  pricePeriods!: PricePeriod[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
