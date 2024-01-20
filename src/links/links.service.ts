import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  private readonly LINKS_COLLECTION = 'links';

  constructor(@Inject('MONGO_DB') private readonly db: Db) {}

  async create(createLinkDto: CreateLinkDto, ownerId: string) {
    const newLink = await this.db.collection(this.LINKS_COLLECTION).insertOne({
      ...createLinkDto,
      ownerId: new ObjectId(ownerId),
      folderIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (newLink.acknowledged) {
      return { ok: true, _id: newLink.insertedId };
    }

    throw new InternalServerErrorException('Unable to create a link.');
  }

  async findAll() {
    return await this.db
      .collection(this.LINKS_COLLECTION)
      .find({}, { sort: { createdAt: -1 } })
      .toArray();
  }

  async findOne(id: string) {
    return await this.db.collection(this.LINKS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });
  }

  async update(id: string, updateLinkDto: UpdateLinkDto) {
    try {
      // TODO:

      // TODO
      const updatedDoc = await this.db
        .collection(this.LINKS_COLLECTION)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateLinkDto, updatedAt: new Date() } },
          { returnDocument: 'after' },
        );

      if (updatedDoc) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to update link.', {
        cause: error,
        description: error.message,
      });
    }
  }

  async remove(id: string) {
    try {
      const deleteResult = await this.db
        .collection(this.LINKS_COLLECTION)
        .deleteOne({
          _id: new ObjectId(id),
        });

      if (deleteResult.deletedCount) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to delete link.', {
        cause: error,
        description: error.message,
      });
    }
  }

  /**
   * TODO: user specific actions
   */

  async getPublicLinks(userId: string) {
    try {
      return this.db
        .collection(this.LINKS_COLLECTION)
        .find({
          ownerId: new ObjectId(userId),
          isPrivate: false,
        })
        .toArray();
    } catch (error) {
      throw new UnprocessableEntityException(
        'Unable to get links of this user.',
        {
          cause: error,
          description: error.message,
        },
      );
    }
  }

  /**
   * TODO: folder specific actions
   */

  async addToFolder(id: string, folderId: string, userId: string) {
    // check if user is the owner
    const link = await this.db.collection(this.LINKS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });

    if (!new ObjectId(userId).equals(link.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }

    // update the link with new folderId pushed into folderIds
    const updatedLink = await this.update(id, {
      folderIds: [
        // TODO: improve this comment
        // filters the existing folderIds that are not the current working folderId
        ...link.folderIds.filter((fId) => !new ObjectId(folderId).equals(fId)),
        new ObjectId(folderId),
      ],
    });

    if (updatedLink.ok) return { ok: true };

    return { ok: false };
  }

  async removeFromFolder(id: string, folderId: string, userId: string) {
    // check if user is the owner
    const link = await this.db.collection(this.LINKS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });

    if (!new ObjectId(userId).equals(link.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }

    // check if the link is already linked to the folder, then unlink
    const updatedLink = await this.update(id, {
      folderIds: [
        // TODO: improve this comment
        // filters the existing folderIds that are not the current working folderId
        ...link.folderIds.filter((fId) => !new ObjectId(folderId).equals(fId)),
      ],
    });

    if (updatedLink.ok) return { ok: true };

    return { ok: false };
  }
}
