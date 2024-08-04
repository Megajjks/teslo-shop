/* eslint-disable prettier/prettier */
import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())
  
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    if ( !user ) {
      throw new BadRequestException('user not found');
    }

    for (const role of user.role) {
      if ( validRoles.includes(role)){
        return true
      }
    }

    console.log({userRoles: user.role})
    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`
    )
  }
}
