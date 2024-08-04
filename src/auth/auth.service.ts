/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { IJwtPayload } from './interfaces/jwt-payload.interfaces';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {
   
    try{
      const {password, ...userDate} = createUserDto
      const user = this.userRepository.create({
        ...userDate,
        password: bcrypt.hashSync(password,10)
      });
      
      await this.userRepository.save(user);
      
      return {
        ...user,
        token: this.getJwtToken({id : user.id})
      };
    } catch(e){
      this.handleDBErrors(e);
    }
  }

  async login(loginUserDto: LoginUserDto){
      const {password, email} = loginUserDto;

      const user = await this.userRepository.findOne({
        where: {email},
        select: {email:true, password:true, id:true}
      });

      if (!user){
        throw new UnauthorizedException('Credentials are not valid (email)');
      }
      if (!bcrypt.compareSync(password, user.password)){
        throw new UnauthorizedException('Credentials are not valid (password)');
      }

      return {
        ...user,
        token: this.getJwtToken({id : user.id})
      };
  }

  private getJwtToken (payload: IJwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;
  }

  private handleDBErrors(e: any): never{
    if ( e.code === '23505')
      throw new BadRequestException(e.detail);
    console.log(e)
    throw new InternalServerErrorException('Please check server logs')
    
  }
}
