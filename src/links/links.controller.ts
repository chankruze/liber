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
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  create(@Body() createLinkDto: CreateLinkDto, @Req() request: Request) {
    const ownerId = request['user'].sub;
    return this.linksService.create(createLinkDto, ownerId);
  }

  @Get()
  findAll() {
    return this.linksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.linksService.update(id, updateLinkDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].sub;
    return this.linksService.remove(id, userId);
  }

  /**
   * TODO: user specific actions
   */

  @Get('/u/:userId')
  getPublicLinks(@Param('userId') userId: string) {
    return this.linksService.getPublicLinks(userId);
  }

  /**
   * TODO: folder specific actions
   */

  @Patch(':id/f/:folderId')
  addToFolder(
    @Param('id') id: string,
    @Param('folderId') folderId: string,
    @Req() request: Request,
  ) {
    const ownerId = request['user'].sub;
    return this.linksService.addToFolder(id, folderId, ownerId);
  }

  @Delete(':id/f/:folderId')
  removeFromFolder(
    @Param('id') id: string,
    @Param('folderId') folderId: string,
    @Req() request: Request,
  ) {
    const ownerId = request['user'].sub;
    return this.linksService.removeFromFolder(id, folderId, ownerId);
  }
}
