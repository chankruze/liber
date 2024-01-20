import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto, @Req() request: Request) {
    // TODO: check the db if the user exists
    // TODO: if the user exists then proceed
    const ownerId = request['user'].sub;
    return this.foldersService.create(createFolderDto, ownerId);
  }

  @Get()
  findAll() {
    // TODO: require user id or handle of whom a user wants to list
    // TODO: only list public folders of a user to public
    // TODO: accept ordering (ASC/DESC) key as param
    return this.foldersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto) {
    return this.foldersService.update(id, updateFolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foldersService.remove(id);
  }

  @Get('/u/:userId')
  getPublicFolders(@Param('userId') userId: string) {
    return this.foldersService.getPublicFolders(userId);
  }

  @Get(':id/links')
  getLinksInFolder(@Param('id') id: string, @Query('p') p: boolean) {
    return this.foldersService.getAllLinksOfFolder(id, p);
  }
}
