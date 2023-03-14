import Mongoose from 'mongoose';
import { CreateProjectDto } from '../src/modules/project/dto/create-project.dto';
import { CreateAddressDto } from '../src/modules/address/dto/create-address.dto';
import { Role } from '../src/common/enums/role.enum';
import { addDays } from '../src/helpers/date/date-helper';
import { CreateApiKeyDto } from '../src/modules/api-key/dto/create-api-key.dto';
import { ApiKeyDto } from '../src/modules/api-key/dto/api-key.dto';
import { TransactionRequestStatus } from '../src/common/enums/transaction-request.enum';
import { CreateTransactionRequestDto } from '../src/modules/transaction-request/dto/create-transaction-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionRequestDto } from '../src/modules/transaction-request/dto/transaction-request.dto';
import { TransactionRequestType } from '../src/common/enums/transaction-request-type.enum';
import { DeployedContractStatus } from '../src/common/enums/deployed-contract-status.enum';
import { PublicTransactionRequestDto } from '../src/modules/transaction-request/dto/public-transaction-request.dto';

export const mockAuthUser = {
  uid: 'rimatikdev.testnet',
  username: 'rimatikdev.testnet',
  accountType: 'near',
  nearWalletAccountId: 'rimatikdev.testnet',
  _id: new Mongoose.Types.ObjectId('634ff3d708393072d5daa871'),
};

export const mockUser = {
  _id: new Mongoose.Types.ObjectId('634ff3d708393072d5daa871'),
  updatedAt: new Date(),
  createdAt: new Date(),
  isCensored: true,
  isActive: true,
  uid: 'dev3.testnet',
  accountType: 'near',
  roles: [Role.Customer],
  username: 'dev3.testnet',
  nearWalletAccountId: 'dev3.testnet',
};

export const mockAddress = {
  wallet: 'john.near',
  alias: 'johhy1',
  email: 'john@email.com',
  phone: '+38599345687',
  owner: mockUser,
  _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff5d'),
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockAddresses = [
  mockAddress,
  {
    wallet: 'marc.near',
    alias: 'marc1',
    email: 'marc@email.com',
    phone: '+38599345688',
    owner: {
      _id: new Mongoose.Types.ObjectId('634ff3d708393072d5daa845'),
      updatedAt: new Date(),
      createdAt: new Date(),
      isCensored: true,
      isActive: true,
      uid: 'dev4.testnet',
      accountType: 'near',
      roles: [Role.Customer],
      username: 'dev4.testnet',
      nearWalletAccountId: 'dev4.testnet',
    },
    _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff6d'),
    updatedAt: new Date(),
    createdAt: new Date(),
  },
];

export const mockCreateAddressDto1: CreateAddressDto = {
  wallet: mockAddresses[0].wallet,
  alias: mockAddresses[0].alias,
  email: mockAddresses[0].email,
  phone: mockAddresses[0].phone,
  owner: mockUser._id,
};

export const mockCreateAddressDto2: CreateAddressDto = {
  wallet: mockAddresses[1].wallet,
  alias: mockAddresses[1].alias,
  email: mockAddresses[1].email,
  phone: mockAddresses[1].phone,
  owner: mockUser._id,
};

export const mockCreateAddressDtos = [
  mockCreateAddressDto1,
  mockCreateAddressDto2,
];
export const mockFile1 = {
  _id: new Mongoose.Types.ObjectId('6398491ef34acc5f99d54a24'),
  name: 'logo-social.png',
  mime_type: 'image/png',
  url: 'http://localhost/5aa3713e-65d3-43df-a9e2-d28314695f6b-logo.png',
  key: '5aa3713e-65d3-43df-a9e2-d28314695f6b-logo.png',
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockFile1Dto = {
  _id: mockFile1._id,
  name: 'logo-social.png',
  mime_type: 'image/png',
  url: 'http://localhost/5aa3713e-65d3-43df-a9e2-d28314695f6b-logo.png',
  key: '5aa3713e-65d3-43df-a9e2-d28314695f6b-logo.png',
  owner: mockUser._id,
};

export const mockProject1 = {
  name: 'dev3-test',
  slug: 'slug-1234',
  logo: mockFile1,
  owner: mockUser,
  _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff5d'),
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockProject2 = {
  name: 'project',
  slug: 'slug-1232',
  logo: mockFile1,
  owner: mockUser,
  _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff5f'),
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockProject3 = {
  name: 'project12',
  slug: 'slug-1235',
  logo: mockFile1,
  owner: mockUser,
  _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff5c'),
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockProject4 = {
  name: 'super-must',
  slug: 'super-must-my24',
  logo: mockFile1,
  owner: mockUser,
  _id: new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff5a'),
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockProjects = [
  mockProject1,
  mockProject2,
  mockProject3,
  mockProject4,
];

export const mockCreateProjectDto1: CreateProjectDto = {
  name: mockProject1.name,
  slug: mockProject1.slug,
  logo_id: mockFile1._id.toString(),
  owner: mockUser._id,
};

export const mockCreateProjectDto2: CreateProjectDto = {
  name: mockProject2.name,
  slug: mockProject2.slug,
  logo_id: mockFile1._id.toString(),
  owner: mockUser._id,
};

export const mockCreateProjectDto3: CreateProjectDto = {
  name: mockProject3.name,
  slug: mockProject3.slug,
  logo_id: mockFile1._id.toString(),
  owner: mockUser._id,
};

export const mockCreateProjectDto4: CreateProjectDto = {
  name: mockProject4.name,
  slug: mockProject4.slug,
  logo_id: mockFile1._id.toString(),
  owner: mockUser._id,
};

export const mockCreateProjectDtos = [
  mockCreateProjectDto1,
  mockCreateProjectDto2,
  mockCreateProjectDto3,
  mockCreateProjectDto4,
];

export const mockProjectDto = {
  id: mockProjects[0]._id.toString(),
  name: mockProjects[0].name,
  slug: mockProjects[0].slug,
  logo_url: mockProjects[0].logo.url,
};

export const mockApiKey1 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bc85ed5475a1ff5d'),
  expires: addDays(new Date(), 30),
  is_revoked: false,
  project: mockProject1._id,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockApiKey2 = {
  _id: new Mongoose.Types.ObjectId('784fe1e4cd85ed5475a1ff5d'),
  expires: addDays(new Date(), 30),
  is_revoked: false,
  project: mockProject2._id,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockApiKey3 = {
  _id: new Mongoose.Types.ObjectId('784ff1e3bb85fd5475a1ff5d'),
  expires: addDays(new Date(), 30),
  is_revoked: false,
  project: mockProject3._id,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockApiKey4 = {
  _id: new Mongoose.Types.ObjectId('784ff2e4bb85fd4475a1ff5d'),
  expires: addDays(new Date(), 30),
  is_revoked: false,
  project: mockProject4._id,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockApiKeys = [mockApiKey1, mockApiKey2, mockApiKey3, mockApiKey4];

export const mockCreateApiKeyDto1: CreateApiKeyDto = {
  project_id: mockApiKey1.project.toString(),
  expires: mockApiKey1.expires,
  owner: mockUser._id,
};

export const mockCreateApiKeyDto2: CreateApiKeyDto = {
  project_id: mockApiKey2.project.toString(),
  expires: mockApiKey2.expires,
  owner: mockUser._id,
};

export const mockCreateApiKeyDto3: CreateApiKeyDto = {
  project_id: mockApiKey3.project.toString(),
  expires: mockApiKey3.expires,
  owner: mockUser._id,
};

export const mockCreateApiKeyDto4: CreateApiKeyDto = {
  project_id: mockApiKey4.project.toString(),
  expires: mockApiKey4.expires,
  owner: mockUser._id,
};

export const mockCreateApiKeyDtos = [
  mockCreateApiKeyDto1,
  mockCreateApiKeyDto2,
  mockCreateApiKeyDto3,
  mockCreateApiKeyDto4,
];

export const mockApiKeyDtos: ApiKeyDto[] = [
  {
    id: mockApiKey1._id.toString(),
    created_at: mockApiKey1.createdAt,
    expires: mockApiKey1.expires,
    is_revoked: mockApiKey1.is_revoked,
    api_key: '123',
    project_id: mockApiKey1.project.toString(),
  },
  {
    id: mockApiKey2._id.toString(),
    created_at: mockApiKey2.createdAt,
    expires: mockApiKey2.expires,
    is_revoked: mockApiKey2.is_revoked,
    api_key: '123',
    project_id: mockApiKey2.project.toString(),
  },
  {
    id: mockApiKey3._id.toString(),
    created_at: mockApiKey3.createdAt,
    expires: mockApiKey3.expires,
    is_revoked: mockApiKey3.is_revoked,
    api_key: '123',
    project_id: mockApiKey3.project.toString(),
  },
  {
    id: mockApiKey4._id.toString(),
    created_at: mockApiKey4.createdAt,
    expires: mockApiKey4.expires,
    is_revoked: mockApiKey4.is_revoked,
    api_key: '123',
    project_id: mockApiKey4.project.toString(),
  },
];

export const mockTransactionRequest1 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bc85ec5475a1ff5d'),
  uuid: uuidv4(),
  type: TransactionRequestType.Transaction,
  status: TransactionRequestStatus.Pending,
  contractId: '123',
  method: 'withdraw',
  args: JSON.stringify({ arg1: 1, arg2: '2', arg3: ['12', '1'] }),
  meta: JSON.stringify({ name: 'token', decimals: 18 }),
  is_near_token: false,
  gas: '1000000000000000000000000',
  project: mockProject1,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockTransactionRequest2 = {
  _id: new Mongoose.Types.ObjectId('784fe1e4cd85ed4355a1ff5d'),
  uuid: uuidv4(),
  type: TransactionRequestType.Payment,
  status: TransactionRequestStatus.Pending,
  contractId: '123',
  method: 'ft_transfer',
  args: JSON.stringify({ receiver_id: 'bob.dev3.testnet', amount: '19' }),
  is_near_token: false,
  project: mockProject2,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockTransactionRequest3 = {
  _id: new Mongoose.Types.ObjectId('784ff1e3bb85fd2135a1ff5d'),
  uuid: uuidv4(),
  type: TransactionRequestType.Transaction,
  status: TransactionRequestStatus.Pending,
  contractId: '125',
  method: 'withdraw',
  gas: '1000000000000000000000000',
  is_near_token: false,
  project: mockProject3,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockTransactionRequest4 = {
  _id: new Mongoose.Types.ObjectId('784ff2e4bb85fd1125a1ff5d'),
  uuid: uuidv4(),
  type: TransactionRequestType.Payment,
  status: TransactionRequestStatus.Pending,
  contractId: '123',
  method: 'deposit',
  is_near_token: false,
  project: mockProject4,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockTransactionRequests = [
  mockTransactionRequest1,
  mockTransactionRequest2,
  mockTransactionRequest3,
  mockTransactionRequest4,
];

export const mockCreateTransactionRequestDto1: CreateTransactionRequestDto = {
  type: mockTransactionRequest1.type,
  contractId: mockTransactionRequest1.contractId,
  uuid: mockTransactionRequest1.uuid,
  method: mockTransactionRequest1.method,
  meta: mockTransactionRequest1.meta,
  args: mockTransactionRequest1.args,
  gas: mockTransactionRequest1.gas,
  is_near_token: mockTransactionRequest1.is_near_token,
  project_id: mockTransactionRequest1.project._id.toString(),
  project: mockTransactionRequest1.project._id,
  owner: mockUser._id,
};

export const mockCreateTransactionRequestDto2: CreateTransactionRequestDto = {
  type: mockTransactionRequest2.type,
  contractId: mockTransactionRequest2.contractId,
  uuid: mockTransactionRequest2.uuid,
  method: mockTransactionRequest2.method,
  args: mockTransactionRequest2.args,
  is_near_token: mockTransactionRequest2.is_near_token,
  project_id: mockTransactionRequest2.project._id.toString(),
  project: mockTransactionRequest2.project._id,
  owner: mockUser._id,
};

export const mockCreateTransactionRequestDto3: CreateTransactionRequestDto = {
  type: mockTransactionRequest3.type,
  contractId: mockTransactionRequest3.contractId,
  uuid: mockTransactionRequest3.uuid,
  method: mockTransactionRequest3.method,
  is_near_token: mockTransactionRequest3.is_near_token,
  gas: mockTransactionRequest3.gas,
  project_id: mockTransactionRequest3.project._id.toString(),
  project: mockTransactionRequest3.project._id,
  owner: mockUser._id,
};

export const mockCreateTransactionRequestDto4: CreateTransactionRequestDto = {
  type: mockTransactionRequest4.type,
  contractId: mockTransactionRequest4.contractId,
  uuid: mockTransactionRequest4.uuid,
  method: mockTransactionRequest4.method,
  is_near_token: mockTransactionRequest4.is_near_token,
  project_id: mockTransactionRequest4.project._id.toString(),
  project: mockTransactionRequest4.project._id,
  owner: mockUser._id,
};
export const mockCreateTransactionRequestDto5: CreateTransactionRequestDto = {
  type: mockTransactionRequest1.type,
  contractId: mockTransactionRequest1.contractId,
  uuid: mockTransactionRequest1.uuid,
  method: mockTransactionRequest1.method,
  args: mockTransactionRequest1.args,
  gas: mockTransactionRequest1.gas,
  is_near_token: mockTransactionRequest1.is_near_token,
  project_id: mockTransactionRequest1.project._id.toString(),
  project: mockTransactionRequest1.project._id,
  owner: mockUser._id,
};

export const mockCreateTransactionRequestDtos = [
  mockCreateTransactionRequestDto1,
  mockCreateTransactionRequestDto2,
  mockCreateTransactionRequestDto3,
  mockCreateTransactionRequestDto4,
  mockCreateTransactionRequestDto5,
];

export const mockTransactionRequestDto: TransactionRequestDto = {
  contractId: mockTransactionRequest1.contractId,
  type: mockTransactionRequest1.type,
  uuid: mockTransactionRequest1.uuid,
  method: mockTransactionRequest1.method,
  args: mockTransactionRequest1.args,
  gas: mockTransactionRequest1.gas,
  txHash: '123',
  txDetails: JSON.stringify({ name: '123', lastname: '222' }),
  project_id: mockTransactionRequest1.project._id.toString(),
  created_at: mockTransactionRequest1.createdAt,
  status: mockTransactionRequest1.status,
  caller_address: 'bob.testnet',
  is_near_token: false,
};

export const mockContractTemplate1 = {
  _id: new Mongoose.Types.ObjectId('784ed1f4ba85ec2475a1ef5d'),
  name: 'ERC20 Fixed Supply',
  description:
    'ERC20 fungible token with fixed supply and ability to burn the tokens.',
  is_audited: false,
  tags: ['tokens', 'finance'],
  creator_name: 'dev3',
  github_url:
    'https://github.com/4-point-0/dev3-contracts/blob/dev/contracts/dev3/fungible-token/manifest.json',
  info_markdown_url:
    'https://raw.githubusercontent.com/4-point-0/dev3-contracts/dev/contracts/dev3/fungible-token/info.md?token=123',
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockContractTemplate2 = {
  _id: new Mongoose.Types.ObjectId('783fa1f4ba85ec2475a1ef5d'),
  name: 'ERC721 Basic Mintable',
  description: 'ERC721 NFT implementation with mintable by admin',
  is_audited: false,
  tags: ['nft'],
  creator_name: 'dev3',
  github_url:
    'https://github.com/4-point-0/dev3-contracts/blob/dev/contracts/dev3/non-fungible-token/manifest.json',
  info_markdown_url:
    'https://raw.githubusercontent.com/4-point-0/dev3-contracts/dev/contracts/dev3/non-fungible-token/info.md?token=234',
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockContractTemplate3 = {
  _id: new Mongoose.Types.ObjectId('783fa1f4bb85ec3265a1ef5d'),
  name: 'Rewarder',
  description: 'Smart contract which allows creating claimable token coupons.',
  is_audited: true,
  tags: ['token distribution', 'vouchers', 'secret code airdrop'],
  creator_name: 'community',
  github_url:
    'https://github.com/4-point-0/dev3-contracts/blob/dev/contracts/community/disperse/manifest.json',
  info_markdown_url:
    'https://raw.githubusercontent.com/4-point-0/dev3-contracts/dev/contracts/community/disperse/info.md?token=721',
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockContractTemplate4 = {
  _id: new Mongoose.Types.ObjectId('783fa1f4bb85ec3265b2ef5d'),
  name: 'Disperse',
  description: 'Smart contract for token and native coin distribution.',
  is_audited: false,
  tags: ['token distribution', 'disperse', 'batch payments'],
  creator_name: 'community',
  github_url:
    'https://github.com/4-point-0/dev3-contracts/blob/dev/contracts/community/rewarder/manifest.json',
  info_markdown_url:
    'https://raw.githubusercontent.com/4-point-0/dev3-contracts/dev/contracts/community/rewarder/info.md?token=321',
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockContractTemplates = [
  mockContractTemplate1,
  mockContractTemplate2,
  mockContractTemplate3,
  mockContractTemplate4,
];

export const mockContractTemplateDto1 = {
  name: mockContractTemplate1.name,
  description: mockContractTemplate1.description,
  is_audited: mockContractTemplate1.is_audited,
  tags: mockContractTemplate1.tags,
  creator_name: mockContractTemplate1.creator_name,
  github_url: mockContractTemplate1.github_url,
  info_markdown_url: mockContractTemplate1.info_markdown_url,
};

export const mockContractTemplateDto2 = {
  name: mockContractTemplate2.name,
  description: mockContractTemplate2.description,
  is_audited: mockContractTemplate2.is_audited,
  tags: mockContractTemplate2.tags,
  creator_name: mockContractTemplate2.creator_name,
  github_url: mockContractTemplate2.github_url,
  info_markdown_url: mockContractTemplate2.info_markdown_url,
};

export const mockContractTemplateDto3 = {
  name: mockContractTemplate3.name,
  description: mockContractTemplate3.description,
  is_audited: mockContractTemplate3.is_audited,
  tags: mockContractTemplate3.tags,
  creator_name: mockContractTemplate3.creator_name,
  github_url: mockContractTemplate3.github_url,
  info_markdown_url: mockContractTemplate3.info_markdown_url,
};

export const mockContractTemplateDto4 = {
  name: mockContractTemplate4.name,
  description: mockContractTemplate4.description,
  is_audited: mockContractTemplate4.is_audited,
  tags: mockContractTemplate4.tags,
  creator_name: mockContractTemplate4.creator_name,
  github_url: mockContractTemplate4.github_url,
  info_markdown_url: mockContractTemplate4.info_markdown_url,
};

export const mockContractTemplateDtos = [
  mockContractTemplateDto1,
  mockContractTemplateDto2,
  mockContractTemplateDto3,
  mockContractTemplateDto4,
];

export const mockDeployedContract1 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bc85ec2475a1ef5d'),
  uuid: uuidv4(),
  alias: 'my-erc20',
  args: JSON.stringify({ name: 'DSN', totalSupply: 100 }),
  tags: ['tokens', 'finance'],
  status: DeployedContractStatus.Pending,
  contract_template: mockContractTemplate1,
  project: mockProject1,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockDeployedContract2 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bc85ec2475a1ef5d'),
  uuid: uuidv4(),
  alias: 'your-erc20',
  args: JSON.stringify({ name: 'DSB', totalSupply: 100 }),
  tags: ['tokens', 'finance'],
  status: DeployedContractStatus.Pending,
  contract_template: mockContractTemplate1,
  project: mockProject1,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockDeployedContract3 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bc85ec2475a1ef5d'),
  uuid: uuidv4(),
  alias: 'my-nft-contract',
  args: JSON.stringify({ name: 'NFT', totalSupply: 20 }),
  tags: ['nft'],
  status: DeployedContractStatus.Pending,
  contract_template: mockContractTemplate2,
  project: mockProject1,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockDeployedContract4 = {
  _id: new Mongoose.Types.ObjectId('784ff1e4bb75ac2475a1ef5d'),
  uuid: uuidv4(),
  alias: 'my-rewarder',
  args: JSON.stringify({ name: 'Reward-people' }),
  tags: ['token distribution', 'vouchers', 'secret code airdrop'],
  status: DeployedContractStatus.Pending,
  contract_template: mockContractTemplate3,
  project: mockProject1,
  owner: mockUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockDeployedContracts = [
  mockDeployedContract1,
  mockDeployedContract2,
  mockDeployedContract3,
  mockDeployedContract4,
];

export const mockCreateDeployedContractDto1 = {
  alias: mockDeployedContract1.alias,
  contract_template_id: mockDeployedContract1.contract_template._id.toString(),
  args: mockDeployedContract1.args,
  project_id: mockDeployedContract1.project._id.toString(),
  owner: mockUser._id,
};

export const mockCreateDeployedContractDto2 = {
  alias: mockDeployedContract2.alias,
  contract_template_id: mockDeployedContract2.contract_template._id.toString(),
  args: mockDeployedContract2.args,
  project_id: mockDeployedContract2.project._id.toString(),
  owner: mockUser._id,
};

export const mockCreateDeployedContractDto3 = {
  alias: mockDeployedContract3.alias,
  contract_template_id: mockDeployedContract3.contract_template._id.toString(),
  args: mockDeployedContract3.args,
  project_id: mockDeployedContract3.project._id.toString(),
  owner: mockUser._id,
};

export const mockCreateDeployedContractDto4 = {
  alias: mockDeployedContract4.alias,
  contract_template_id: mockDeployedContract4.contract_template._id.toString(),
  args: mockDeployedContract4.args,
  project_id: mockDeployedContract4.project._id.toString(),
  owner: mockUser._id,
};

export const mockCreateDeployedContractDtos = [
  mockCreateDeployedContractDto1,
  mockCreateDeployedContractDto2,
  mockCreateDeployedContractDto3,
  mockCreateDeployedContractDto4,
];

export const mockDeployedContractDto = {
  uuid: mockDeployedContract1.uuid,
  contract_template_name: mockDeployedContract1.contract_template.name,
  contract_template_description:
    mockDeployedContract1.contract_template.description,
  alias: mockDeployedContract1.alias,
  tags: mockDeployedContract1.tags,
  status: mockDeployedContract1.status,
  args: mockDeployedContract1.args,
  project_name: mockDeployedContract1.project.name,
  project_logo_url: mockDeployedContract1.project.logo
    ? mockDeployedContract1.project.logo.url
    : null,
  created_at: mockDeployedContract1.createdAt,
  updated_at: mockDeployedContract1.updatedAt,
};

export const mockPublicTransactionRequestDto: PublicTransactionRequestDto = {
  contractId: mockTransactionRequest1.contractId,
  type: mockTransactionRequest1.type,
  uuid: mockTransactionRequest1.uuid,
  method: mockTransactionRequest1.method,
  args: mockTransactionRequest1.args,
  gas: mockTransactionRequest1.gas,
  txHash: '123',
  txDetails: JSON.stringify({ name: '123', lastname: '222' }),
  project: {
    name: mockTransactionRequest1.project.name,
    logo_url: mockTransactionRequest1.project.logo.url,
  },
  created_at: mockTransactionRequest1.createdAt,
  status: mockTransactionRequest1.status,
  caller_address: 'bob.testnet',
  is_near_token: false,
};
