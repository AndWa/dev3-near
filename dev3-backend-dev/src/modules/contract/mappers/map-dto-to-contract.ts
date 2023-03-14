import { ContractDto } from '../dto/contract.dto';
import { Contract } from '../entities/contract.entity';
import Mongoose, { Document } from 'mongoose';

export const mapDtoToContract = (
  entity: Contract &
    Document<any, any, any> & {
      _id: Mongoose.Types.ObjectId;
    },
  dto: ContractDto,
): Contract &
  Document<any, any, any> & {
    _id: Mongoose.Types.ObjectId;
  } => {
  entity.name = dto.name;
  entity.description = dto.description;
  entity.is_audited = dto.is_audited;
  entity.tags = dto.tags;
  entity.creator_name = dto.creator_name;
  entity.github_url = dto.github_url;
  entity.info_markdown_url = dto.info_markdown_url;
  return entity;
};
