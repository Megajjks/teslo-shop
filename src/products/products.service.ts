/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { Product, ProductImage } from './entities';
import { validate as isUUID} from "uuid";
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>, 
    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto, user:User) {

    try{
      const {images = [], ...productDetails} = createProductDto;
      const product = this.productRepository.create({
        ...productDetails, 
        images: images.map(image => this.productImageRepository.create({ url: image}) ),
        user,
      }); //crea la instancia del producto
      await this.productRepository.save(product) // guardo la instancia en la bd
      return product
    }catch(e){
      console.log(e)
      this.handleDBExceptions(e)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    
    const {limit = 10, offset = 0} = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images:true,
      }
    });

    return products.map( ({ images, ...rest}) => ({
      ...rest,
      images: images.map( img => img.url)
    }))
  }

  async findOne(query: string) {

    try{
      let product: Product
      if(isUUID(query)){
        product = await this.productRepository.findOneBy({id: query})
      } else{
        const queryBuilder = this.productRepository.createQueryBuilder('prod')
        product = await queryBuilder
          .where('title =:title or slug =:slug', {
            title: query,
            slug: query
          })
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne()
      }
      if (!product)
        throw new NotFoundException(`Product with not found`)
      return product;
    } catch(e){
      this.handleDBExceptions(e)
    }
  }

  async findOnePlain (query: string) {
    const { images = [], ...rest} = await this.findOne(query);
    return{
      ...rest,
      images:images.map( image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    const { images, ...toUpdate } = updateProductDto;
    // procesando el cambio antes de enviar el cambio a la bd
    const product = await this.productRepository.preload({
      id, 
      ...toUpdate
    })

    if(!product) 
      throw new NotFoundException(`Product with id: ${id} not found`)
    
    // Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{

      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id }});
        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        )
      }

      //add user
      product.user = user;
      await queryRunner.manager.save( product)

      //save the change in the bd
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);

    }catch(e){
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

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

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try{
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error){
      this.handleDBExceptions(error);
    }
  }

}
