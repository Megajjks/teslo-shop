/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('numeric',{
    default:0
  })
  price: number;

  // otra forma de definir tipos
  @Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text',)
  genders: string;

}
