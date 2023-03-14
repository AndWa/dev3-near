import { ContractManifestDto } from '../dto/contract-manifest.dto';

export const mapRepoToContractDto = (
  manifestInfo: ContractManifestDto,
  path: string,
  creatorName: string,
  info_markdown_url: string,
) => {
  return {
    name: manifestInfo.name,
    description: manifestInfo.description,
    tags: manifestInfo.tags,
    creator_name: creatorName,
    github_url: path,
    info_markdown_url: info_markdown_url,
    is_audited: false,
  };
};
