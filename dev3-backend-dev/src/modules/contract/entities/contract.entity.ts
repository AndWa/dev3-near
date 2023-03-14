import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BaseEntity } from '../../../common/entities/base-entity';

export type ContractDocument = Contract & Document;

@Schema({
  _id: true,
})
export class Contract extends BaseEntity {
  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    type: Boolean,
  })
  @Prop({ required: false, default: false })
  is_audited: boolean;

  @ApiProperty({
    type: [String],
  })
  @Prop({ required: true })
  tags: string[];

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  creator_name: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  github_url: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  info_markdown_url: string;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
