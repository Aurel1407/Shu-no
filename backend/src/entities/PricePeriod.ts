import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

@Entity()
export class PricePeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @ManyToOne(() => Product, product => product.pricePeriods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column('decimal')
  price!: number;

  @Column({ nullable: true })
  name?: string; // Nom de la période (ex: "Haute saison", "Basse saison")
}
