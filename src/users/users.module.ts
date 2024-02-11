import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'DICEBEAR_CORE',
      useFactory: async () => await import('@dicebear/core'),
    },
    {
      provide: 'DICEBEAR_COLLECTION',
      useFactory: async () => await import('@dicebear/collection'),
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

// Docs

// NestJs
// |-(Factory providers) https://docs.nestjs.com/fundamentals/custom-providers#export-custom-provider
