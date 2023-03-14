import Mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@nestjs/mongoose';

export class BaseEntity {
  _id: Mongoose.Types.ObjectId;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
