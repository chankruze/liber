import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  private readonly FOLDERS_COLLECTION = 'folders';

  constructor(@Inject('MONGO_DB') private readonly db: Db) {}

  async create(createFolderDto: CreateFolderDto) {
    // TODO: 0. add owner info
    // TODO: 1. handle DNS timeout exception
    // TODO: 2. handle read concern error
    const newFolder = await this.db
      .collection(this.FOLDERS_COLLECTION)
      .insertOne({
        ...createFolderDto,
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

  async update(id: string, updateFolderDto: UpdateFolderDto) {
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

  async remove(id: string) {
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
}
