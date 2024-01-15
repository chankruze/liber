import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Docs //

// (Nest.js)
// |-(Mapped types): https://docs.nestjs.com/techniques/validation#mapped-types
