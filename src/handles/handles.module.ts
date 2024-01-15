import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { HandlesController } from './handles.controller';
import { HandlesService } from './handles.service';

@Module({
  imports: [UsersModule],
  controllers: [HandlesController],
  providers: [HandlesService],
  exports: [HandlesService],
})
export class HandlesModule {}
