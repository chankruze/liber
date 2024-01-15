import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { FoldersModule } from './folders/folders.module';
import { HandlesModule } from './handles/handles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    UsersModule,
    AuthModule,
    HandlesModule,
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
