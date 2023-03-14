import { ProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
import Mongoose, { Document } from 'mongoose';

export const mapToProjectDto = (
  entity: Project &
    Document<any, any, any> & {
      _id: Mongoose.Types.ObjectId;
    },
): ProjectDto => {
  return {
    id: entity.id.toString(),
    name: entity.name,
    slug: entity.slug,
    logo_url: entity.logo ? entity.logo.url : null,
  };
};
