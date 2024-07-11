/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  // relaciones
  @ManyToOne(
    () => Product,
    ( product ) => product.images
  )

  product: Product
}