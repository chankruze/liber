import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CheckHandleDto } from './dto/check-handle.dto';

@Injectable()
export class HandlesService {
  constructor(private readonly usersService: UsersService) {}

  async checkAvailability(checkHandleDto: CheckHandleDto) {
    // check in db if the user with given handle already exists
    const isUserExists = await this.usersService.findByHandle(
      checkHandleDto.handle,
    );

    if (isUserExists) {
      // TODO: send back a message or error
      return { isAvailable: false };
      // throw new ConflictException('This handle is already taken.');
    }

    return { isAvailable: true };
  }

  async getUserDetails(checkHandleDto: CheckHandleDto) {
    return await this.usersService.findByHandle(checkHandleDto.handle);
  }
}
