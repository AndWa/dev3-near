import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import Mongoose, { Document } from 'mongoose';
import { Project } from '../../../modules/project/entities/project.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base-entity';

export type ApiKeyDocument = ApiKey & Document;

@Schema({
  _id: true,
})
export class ApiKey extends BaseEntity {
  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  api_key: string;

  @ApiProperty({
    type: Date,
  })
  @Prop({
    required: true,
    validate: [isMinDate, 'Date must be less than the current date!'],
  })
  expires: Date;

  @Prop({
    default: false,
  })
  is_revoked: boolean;

  @Prop({ type: Mongoose.Types.ObjectId, ref: Project.name })
  project: Project;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: User.name })
  owner: User;
}

function isMinDate(date: Date) {
  return date >= new Date();
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
