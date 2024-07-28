/* eslint-disable prettier/prettier */
import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { fileFilter, fileName } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, 
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile( path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits:{ fileSize: 1000}
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileName
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ){
    if (!file){
      throw new BadRequestException('Make sure that the files is a image validate')
    }
    
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${ file.filename }`
    
    return {secureUrl}
  }
}
