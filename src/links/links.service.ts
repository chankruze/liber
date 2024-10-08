import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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

  async update(id: string, updateLinkDto: UpdateLinkDto, userId: string) {
    const link = await this.findOne(id);

    // link availability check
    if (!link) {
      throw new NotFoundException('The link is no longer available.');
    }

    // check link ownership
    // if the request user is the owner then update
    // else throw unauthorized error
    if (!new ObjectId(userId).equals(link.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to update this link.',
      );
    }

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

  async remove(id: string, userId: string) {
    const link = await this.findOne(id);

    // link availability check
    if (!link) {
      throw new NotFoundException('The link is no longer available.');
    }

    // check link ownership
    // if the request user is the owner then delete
    // else throw unauthorized error
    if (!new ObjectId(userId).equals(link.ownerId)) {
      throw new UnauthorizedException(
        'You are not authorized to delete this link.',
      );
    }

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

  async getOnlyLinks(ownerId: string, userId: string) {
    // check folder ownership
    if (userId && new ObjectId(ownerId).equals(new ObjectId(userId))) {
      // if the request user is the owner then list both public and private folders
      return this.db
        .collection(this.LINKS_COLLECTION)
        .find(
          { ownerId: new ObjectId(ownerId), folderIds: { $size: 0 } },
          { sort: { updatedAt: -1, createdAt: -1 } },
        )
        .toArray();
    }

    // else list only public links
    return this.db
      .collection(this.LINKS_COLLECTION)
      .find(
        {
          ownerId: new ObjectId(ownerId),
          folderIds: { $size: 0 },
          isPrivate: false,
        },
        { sort: { updatedAt: -1, createdAt: -1 } },
      )
      .toArray();
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
    const updatedLink = await this.update(
      id,
      {
        folderIds: [
          // TODO: improve this comment
          // filters the existing folderIds that are not the current working folderId
          ...link.folderIds.filter(
            (fId) => !new ObjectId(folderId).equals(fId),
          ),
          new ObjectId(folderId),
        ],
      },
      userId,
    );

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
    const updatedLink = await this.update(
      id,
      {
        folderIds: [
          // TODO: improve this comment
          // filters the existing folderIds that are not the current working folderId
          ...link.folderIds.filter(
            (fId) => !new ObjectId(folderId).equals(fId),
          ),
        ],
      },
      userId,
    );

    if (updatedLink.ok) return { ok: true };

    return { ok: false };
  }

  async getLinksInAFolder(
    folderId: string,
    options: {
      showPrivateLinks: boolean;
    } = { showPrivateLinks: false },
  ) {
    // if the user is the owner then show all links
    if (options.showPrivateLinks) {
      return await this.db
        .collection(this.LINKS_COLLECTION)
        .find({
          folderIds: {
            $in: [new ObjectId(folderId)],
          },
        })
        .toArray();
    }

    return await this.db
      .collection(this.LINKS_COLLECTION)
      .find({
        folderIds: {
          $in: [new ObjectId(folderId)],
        },
        isPrivate: false,
      })
      .toArray();
  }
}

// Docs //

// (MongoDB)
// |-($in): https://www.mongodb.com/docs/manual/reference/operator/query/in/#use-the--in-operator-to-match-values-in-an-array
