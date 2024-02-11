import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Db, ObjectId } from 'mongodb';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly USERS_COLLECTION = 'users';

  constructor(
    @Inject('MONGO_DB') private readonly db: Db,
    @Inject('DICEBEAR_CORE') private readonly dicebearCore: any,
    @Inject('DICEBEAR_COLLECTION')
    private readonly dicebearCollection: any,
  ) {}

  async create(createUserDto: CreateUserDto, ip: string) {
    const { email, handle, name } = createUserDto;

    // check in db if the user already exists
    const userExists = await this.db.collection(this.USERS_COLLECTION).findOne({
      email,
    });

    // if user exists
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    const avatar = await this.dicebearCore
      .createAvatar(this.dicebearCollection.openPeeps, {
        size: 192,
      })
      .toDataUri();

    // https://github.com/chankruze/liber/issues/16
    const newUser = await this.db.collection(this.USERS_COLLECTION).insertOne({
      handle,
      name,
      email,
      avatar,
      bio: `Hey there! I am using liber.`,
      password: passwordHash,
      ip,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (newUser.acknowledged) {
      return {
        ok: true,
        id: newUser.insertedId,
        ...createUserDto,
      };
    }

    throw new InternalServerErrorException('Unable to create a user');
  }

  async findAll() {
    return await this.db
      .collection(this.USERS_COLLECTION)
      .find({}, { projection: { password: 0, ip: 0 } })
      .toArray();
  }

  async findOne(id: string) {
    return await this.db.collection(this.USERS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });
  }

  async findByEmail(email: string) {
    return await this.db
      .collection(this.USERS_COLLECTION)
      .findOne({ email }, { projection: { ip: 0 } });
  }

  async findByHandle(handle: string) {
    return await this.db
      .collection(this.USERS_COLLECTION)
      .findOne(
        { handle },
        { projection: { name: 1, avatar: 1, bio: 1, _id: 0 } },
      );
  }

  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('The user is no longer available.');
    }

    if (!new ObjectId(userId).equals(user._id)) {
      throw new UnauthorizedException(
        'You are not authorized to update this user.',
      );
    }

    try {
      const updatedDoc = await this.db
        .collection(this.USERS_COLLECTION)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateUserDto, updatedAt: new Date() } },
          { returnDocument: 'after' },
        );

      if (updatedDoc) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to update user', {
        cause: error,
        description: error.message,
      });
    }
  }

  async remove(id: string, userId: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('The user is no longer available.');
    }

    if (!new ObjectId(userId).equals(user._id)) {
      throw new UnauthorizedException(
        'You are not authorized to delete this user.',
      );
    }

    try {
      const deleteResult = await this.db
        .collection(this.USERS_COLLECTION)
        .deleteOne({
          _id: new ObjectId(id),
        });

      if (deleteResult.deletedCount) {
        return { ok: true };
      }

      return { ok: false };
    } catch (error) {
      throw new UnprocessableEntityException('Unable to delete user', {
        cause: error,
        description: error.message,
      });
    }
  }
}

// Docs

// mongodb
// |-(findOneAndUpdate()) https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
