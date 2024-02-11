import { Controller, Get, Param } from '@nestjs/common';

import { Public } from 'src/auth/auth.guard';
import { CheckHandleDto } from './dto/check-handle.dto';
import { HandlesService } from './handles.service';

@Controller('handles')
export class HandlesController {
  constructor(private readonly handlesService: HandlesService) {}

  @Public()
  @Get(':handle')
  checkHandleAvailability(@Param() checkHandleDto: CheckHandleDto) {
    return this.handlesService.checkAvailability(checkHandleDto);
  }

  @Public()
  @Get(':handle/details')
  getUserDetails(@Param() checkHandleDto: CheckHandleDto) {
    return this.handlesService.getUserDetails(checkHandleDto);
  }
}
