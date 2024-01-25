import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Public } from 'src/auth/auth.guard';
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
  update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.foldersService.update(id, updateFolderDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].sub;
    return this.foldersService.remove(id, userId);
  }

  /**
   * TODO: user specific actions
   */

  @Public()
  @Get('/u/:ownerId')
  getAllFolders(@Param('ownerId') ownerId: string, @Req() request: Request) {
    if (request['user']) {
      const userId = request['user'].sub;
      return this.foldersService.getAllFolders(ownerId, userId);
    }

    return this.foldersService.getAllFolders(ownerId, '');
  }

  /**
   * TODO: link specific actions
   */

  @Get(':id/links')
  getLinksInFolder(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].sub;
    return this.foldersService.getAllLinksInFolder(id, userId);
  }
}
