/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as isUUID} from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    
    try{
      const product = this.productRepository.create(createProductDto) //crea la instancia del producto
      await this.productRepository.save(product) // guardo la instancia en la bd
      return product
    }catch(e){
      this.handleDBExceptions(e)
    }
  }

  findAll(paginationDto: PaginationDto) {
    
    const {limit = 10, offset = 0} = paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //Todo relaciones
    });
  }

  async findOne(query: string) {

    try{
      let product: Product
      if(isUUID(query)){
        product = await this.productRepository.findOneBy({id: query})
      } else{
        const queryBuilder = this.productRepository.createQueryBuilder()
        product = await queryBuilder
          .where('title =:title or slug =:slug', {
            title: query,
            slug: query
          }).getOne()
      }
      if (!product)
        throw new NotFoundException(`Product with not found`)
      return product;
    } catch(e){
      this.handleDBExceptions(e)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // procesando el cambio antes de enviar el cambio a la bd
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })

    if(!product) 
      throw new NotFoundException(`Product with id: ${id} not found`)
    
    try{
      //save the change in the bd
      await this.productRepository.save(product)
      return product;
    }catch(e){
      this.handleDBExceptions(e);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  private handleDBExceptions( error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail)
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }

}
