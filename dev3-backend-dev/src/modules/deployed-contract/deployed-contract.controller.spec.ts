import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import {
  mockCreateDeployedContractDtos,
  mockDeployedContractDto,
  mockDeployedContracts,
  mockUser,
} from '../../../test/mock-tests-data';
import {
  ServiceResult,
  ServiceResultEmpty,
} from '../../helpers/response/result';
import { Contract } from '../contract/entities/contract.entity';
import { Project } from '../project/entities/project.entity';
import { DeployedContractController } from './deployed-contract.controller';
import { DeployedContractService } from './deployed-contract.service';
import { DeployedContract } from './entities/deployed-contract.entity';
import { DeployedContractDto } from './dto/deployed-contract.dto';

describe('DeployedContractController', () => {
  let deployedContractController: DeployedContractController;
  let deployedContractService: DeployedContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeployedContractController,
        DeployedContractService,
        {
          provide: getModelToken(DeployedContract.name),
          useValue: jest.fn(),
        },
        { provide: getModelToken(Project.name), useValue: jest.fn() },
        { provide: getModelToken(Contract.name), useValue: jest.fn() },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') {
                return 'dev';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    deployedContractService = module.get<DeployedContractService>(
      DeployedContractService,
    );
    deployedContractController = module.get<DeployedContractController>(
      DeployedContractController,
    );
  });

  describe('create', () => {
    it('should create one deployed contract', async () => {
      const result = new ServiceResult<DeployedContract>(
        mockDeployedContracts[0],
      );
      jest.spyOn(deployedContractService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await deployedContractController.create(
        req,
        mockCreateDeployedContractDtos[0],
      );
      expect(response).toBe(result.data);
    });
  });

  describe('findAll', () => {
    it('should return all deployed contracts', async () => {
      const result = new ServiceResult<PaginatedDto<DeployedContract>>({
        total: 4,
        count: 4,
        limit: 0,
        offset: 0,
        results: mockDeployedContracts,
      });
      jest.spyOn(deployedContractService, 'findAll').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await deployedContractController.findAll(req);
      expect(response).toBe(result.data);
    });
  });

  describe('findOne', () => {
    it('should find one deployed contract by uuid', async () => {
      const result = new ServiceResult<DeployedContract>(
        mockDeployedContracts[0],
      );
      jest.spyOn(deployedContractService, 'findOne').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await deployedContractController.findOne(
        req,
        mockDeployedContracts[0].uuid,
      );
      expect(response).toBe(result.data);
    });
  });

  describe('findByUuid', () => {
    it('should find one deployed contract by uuid with public method', async () => {
      const result = new ServiceResult<DeployedContractDto>(
        mockDeployedContractDto,
      );
      jest
        .spyOn(deployedContractService, 'findByUuid')
        .mockResolvedValue(result);
      const response = await deployedContractController.findByUuidPublic(
        mockDeployedContractDto.uuid,
      );
      expect(response).toBe(result.data);
    });
  });

  describe('update', () => {
    it('should update one address', async () => {
      const deployedContract: any = {
        ...mockDeployedContracts[0],
      };
      deployedContract.txHash = '123';
      deployedContract.txDetails = {
        name: 'dule',
        base: '123',
      };

      const result = new ServiceResult<DeployedContractDto>(deployedContract);
      jest.spyOn(deployedContractService, 'update').mockResolvedValue(result);

      const response = await deployedContractController.update(
        deployedContract.uuid,
        {
          txHash: '123',
          txDetails: {
            name: 'dule',
            base: '123',
          },
          deployer_address: 'bob.testnet',
        },
      );
      expect(response.txHash).toBe(deployedContract.txHash);
    });
  });

  describe('delete', () => {
    it('should delete one address', async () => {
      const result = new ServiceResultEmpty();
      jest.spyOn(deployedContractService, 'remove').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };

      const response = await deployedContractController.remove(
        req,
        mockDeployedContracts[0].uuid,
      );

      expect(response).toBeUndefined();
    });
  });
});
