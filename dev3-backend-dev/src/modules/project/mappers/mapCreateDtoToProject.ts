import { CreateProjectDto } from '../dto/create-project.dto';

export const mapCreateDtoToProject = (dto: CreateProjectDto) => {
  return {
    name: dto.name,
    slug: dto.slug,
    logo: null,
    owner: dto.owner,
  };
};
