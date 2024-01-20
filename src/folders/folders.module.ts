import { Module } from '@nestjs/common';
import { LinksModule } from 'src/links/links.module';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [LinksModule],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
