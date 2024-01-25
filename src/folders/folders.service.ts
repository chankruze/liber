import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { LinksService } from 'src/links/links.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  private readonly FOLDERS_COLLECTION = 'folders';

  constructor(
    @Inject('MONGO_DB') private readonly db: Db,
    private readonly linksService: LinksService,
  ) {}

  async create(createFolderDto: CreateFolderDto, ownerId: string) {
    // TODO: 1. add check for duplicate folder name (allow only unique)
    // TODO: 1. handle DNS timeout exception
    // TODO: 2. handle read concern error
    const newFolder = await this.db
      .collection(this.FOLDERS_COLLECTION)
      .insertOne({
        ...createFolderDto,
        ownerId: new ObjectId(ownerId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    if (newFolder.acknowledged) {
      return { ok: true, _id: newFolder.insertedId };
    }
  }

  async findAll() {
    // TODO: accept ordering (ASC/DESC) key as param
    return await this.db
      .collection(this.FOLDERS_COLLECTION)
      .find({}, { sort: { createdAt: -1 } })
      .toArray();
  }

  async findOne(id: string) {
    return await this.db.collection(this.FOLDERS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });
  }

  async update(id: string, updateFolderDto: UpdateFolderDto, userId: string) {
    const folder = await this.findOne(id);

    // folder availability check
    if (!folder) {
      throw new NotFoundException('The folder is no longer available.');
    }

    // check folder ownership
    // if the request user is the owner then update
    // else throw unauthorized error
    if (!new ObjectId(userId).equals(folder.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to update this folder.',
      );
    }

    try {
      const updatedDoc = await this.db
        .collection(this.FOLDERS_COLLECTION)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateFolderDto, updatedAt: new Date() } },
          { returnDocument: 'after' },
        );

      if (updatedDoc) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to update folder', {
        cause: error,
        description: error.message,
      });
    }
  }

  async remove(id: string, userId: string) {
    const folder = await this.findOne(id);

    // folder availability check
    if (!folder) {
      throw new NotFoundException('The folder is no longer available.');
    }

    // check folder ownership
    // if the request user is the owner then delete
    // else throw unauthorized error
    if (!new ObjectId(userId).equals(folder.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to delete this folder.',
      );
    }

    try {
      const deleteResult = await this.db
        .collection(this.FOLDERS_COLLECTION)
        .deleteOne({
          _id: new ObjectId(id),
        });

      if (deleteResult.deletedCount) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to delete folder', {
        cause: error,
        description: error.message,
      });
    }
  }

  /**
   * TODO: user specific actions
   */

  async getAllFolders(ownerId: string, userId: string) {
    // check folder ownership
    if (userId && new ObjectId(ownerId).equals(new ObjectId(userId))) {
      // if the request user is the owner then list both public and private folders
      return this.db
        .collection(this.FOLDERS_COLLECTION)
        .find(
          { ownerId: new ObjectId(ownerId) },
          { sort: { updatedAt: -1, createdAt: -1 } },
        )
        .toArray();
    }

    // else list only public folders
    return this.db
      .collection(this.FOLDERS_COLLECTION)
      .find(
        { ownerId: new ObjectId(ownerId), isPrivate: false },
        { sort: { updatedAt: -1, createdAt: -1 } },
      )
      .toArray();
  }

  async getAllLinksInFolder(id: string, userId: string) {
    const folder = await this.findOne(id);

    // folder availability check
    if (!folder) {
      throw new NotFoundException('The folder is no longer available.');
    }

    // check folder ownership
    if (new ObjectId(userId).equals(folder.ownerId)) {
      // if the request user is the owner then list both public and private links
      return this.linksService.getLinksInAFolder(id, {
        showPrivateLinks: true,
      });
    }

    // else list only public links
    return this.linksService.getLinksInAFolder(id);
  }
}
