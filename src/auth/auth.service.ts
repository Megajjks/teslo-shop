/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {
   
    try{
      const {password, ...userDate} = createUserDto
      const user = this.userRepository.create({
        ...userDate,
        password: bcrypt.hashSync(password,10)
      });
      await this.userRepository.save(user);
      return user;
    } catch(e){
      this.handleDBErrors(e);
    }
  }

  async login(loginUserDto: LoginUserDto){
      const {password, email} = loginUserDto;

      const user = await this.userRepository.findOne({
        where: {email},
        select: {email:true, password:true}
      });

      if (!user){
        throw new UnauthorizedException('Credentials are not valid (email)');
      }
      if (!bcrypt.compareSync(password, user.password)){
        throw new UnauthorizedException('Credentials are not valid (password)');
      }

      return user;
  }

  private handleDBErrors(e: any): never{
    if ( e.code === '23505')
      throw new BadRequestException(e.detail);
    console.log(e)
    throw new InternalServerErrorException('Please check server logs')
    
  }
}
