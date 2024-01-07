import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto, ip: string) {
    return await this.usersService.create(registerUserDto, ip);
  }

  async login(loginUserDto: LoginUserDto) {
    // check in db if the user already exists
    const userExists = await this.usersService.findByEmail(loginUserDto.email);

    // if user exists proceed with password verification
    if (userExists) {
      const _isValid = await bcrypt.compare(
        loginUserDto.password,
        userExists.password,
      );

      if (_isValid) {
        const payload = { sub: userExists._id, email: userExists.email };

        return {
          access_token: await this.jwtService.signAsync(payload),
        };
      }

      // TODO: log this unauthorized access attempt against user's log profile
      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException(`No user found with ${loginUserDto.email}`);
  }
}
