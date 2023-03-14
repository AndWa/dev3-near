import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../modules/user/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base-entity';
import Mongoose from 'mongoose';

export type FileDocument = File & Document;

@Schema({
  _id: true,
})
export class File extends BaseEntity {
  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  mime_type: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  url: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  key: string;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: User.name })
  owner: User;
}

export const FileSchema = SchemaFactory.createForClass(File);
