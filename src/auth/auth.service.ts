import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto, ip: string) {
    const { ok, id, email, handle, name } = await this.usersService.create(
      registerUserDto,
      ip,
    );

    if (ok) {
      const payload = {
        sub: id,
        email,
        handle,
        name,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1y',
      });

      // TODO: save in db/redis

      return {
        accessToken,
        refreshToken,
      };
    }
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
        const payload = {
          sub: userExists._id,
          email: userExists.email,
          handle: userExists.handle,
          name: userExists.name,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
          expiresIn: '1y',
        });

        // TODO: save in db/redis

        return { accessToken, refreshToken };
      }

      // TODO: log this unauthorized access attempt against user's log profile
      throw new UnauthorizedException('Wrong password');
    }

    throw new NotFoundException(`No user found with ${loginUserDto.email}`);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    // Verify the refresh token
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
      );

      // TODO: delete the old refresh token from db/redis

      // Generate new tokens
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1y',
      });

      // TODO: store new tokens in db/redis

      return { accessToken, refreshToken };
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new ForbiddenException('Invalid refresh token');
      }
    }
  }
}
