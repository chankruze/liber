import { Controller, Get, Param } from '@nestjs/common';

import { Public } from 'src/auth/auth.guard';
import { CheckHandleDto } from './dto/check-handle.dto';
import { HandlesService } from './handles.service';

@Controller('handles')
export class HandlesController {
  constructor(private readonly handlesService: HandlesService) {}

  @Public()
  @Get(':handle')
  findOne(@Param() checkHandleDto: CheckHandleDto) {
    return this.handlesService.checkAvailability(checkHandleDto);
  }
}
