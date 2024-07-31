/* eslint-disable prettier/prettier */
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { IJwtPayload } from "../interfaces/jwt-payload.interfaces";
import { User } from "../entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy) {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService :ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }

    async validate( payload: IJwtPayload) : Promise<User> {

        const { email } = payload;
        const user = await this.userRepository.findOneBy({ email });

        if(!user)
            throw new UnauthorizedException('Token not valid');
        if (!user.isActive)
            throw new UnauthorizedException('User is inactive, talk with an admin')

        return;
    }
}