import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  avatar: string;
}

// Docs //

// (Nest.js)
// |-(Mapped types): https://docs.nestjs.com/techniques/validation#mapped-types
