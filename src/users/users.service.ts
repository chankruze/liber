import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Db, ObjectId } from 'mongodb';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly USERS_COLLECTION = 'users';

  constructor(@Inject('MONGO_DB') private readonly db: Db) {}

  async create(createUserDto: CreateUserDto, ip: string) {
    const { email } = createUserDto;

    // check in db if the user already exists
    const userExists = await this.db.collection(this.USERS_COLLECTION).findOne({
      email,
    });

    // if user exists
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    const newUser = await this.db.collection(this.USERS_COLLECTION).insertOne({
      name: createUserDto.name,
      email,
      password: passwordHash,
      ip,
      createdAt: new Date(),
    });

    if (newUser.acknowledged) {
      return { ok: true, _id: newUser.insertedId };
    }

    throw new ConflictException('Unable to create a user');
  }

  async findAll() {
    return await this.db.collection(this.USERS_COLLECTION).find().toArray();
  }

  async findOne(id: string) {
    return await this.db.collection(this.USERS_COLLECTION).findOne({
      _id: new ObjectId(id),
    });
  }

  async findByEmail(email: string) {
    return await this.db.collection(this.USERS_COLLECTION).findOne({
      email,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedDoc = await this.db
        .collection(this.USERS_COLLECTION)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateUserDto } },
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

  async remove(id: string) {
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
