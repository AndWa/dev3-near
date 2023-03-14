import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private repo: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const created = new this.repo(createUserDto);
    return created.save();
  }

  findOne(uid: string): Promise<User> {
    return this.repo
      .findOne({ $or: [{ uid }, { nearWalletAccountId: uid }] })
      .exec();
  }
}
