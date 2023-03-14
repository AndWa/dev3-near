import { DeployedContract } from '../entities/deployed-contract.entity';

export const mapDeployedContractDto = (entity: DeployedContract) => {
  return {
    uuid: entity.uuid,
    contract_template_name: entity.contract_template.name,
    contract_template_description: entity.contract_template.description,
    alias: entity.alias,
    tags: entity.tags,
    status: entity.status,
    args: entity.args,
    address: entity.address,
    txHash: entity.txHash,
    txDetails: entity.txDetails,
    deployer_address: entity.deployer_address,
    project_name: entity.project.name,
    project_logo_url: entity.project.logo ? entity.project.logo.url : null,
    created_at: entity.createdAt,
    updated_at: entity.updatedAt,
  };
};
