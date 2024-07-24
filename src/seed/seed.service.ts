/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) {}

  async runSeed() {
    await this.insertNewProducts();
    return 'SEED EXECUTE';
  }

  private async insertNewProducts(){
    // Borrar todos los productos
    await this.productsService.deleteAllProducts()

    // Insertar productos masivos
    const products = initialData.products;
    const productsPromisesArray = [];

    products.forEach(product => {
      productsPromisesArray.push( this.productsService.create(product))
    })

    await Promise.all(productsPromisesArray)

    return true
  }
}
