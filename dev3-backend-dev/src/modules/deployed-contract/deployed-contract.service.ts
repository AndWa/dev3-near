import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import Mongoose, { Model } from 'mongoose';
import {
  BadRequest,
  NotFound,
  ServerError,
  Unauthorized,
} from '../../helpers/response/errors';
import {
  ServiceResult,
  ServiceResultEmpty,
} from '../../helpers/response/result';
import {
  Contract,
  ContractDocument,
} from '../contract/entities/contract.entity';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { CreateDeployedContractDto } from './dto/create-deployed-contract.dto';
import {
  DeployedContract,
  DeployedContractDocument,
} from './entities/deployed-contract.entity';
import { v4 as uuidv4 } from 'uuid';
import { DeployedContractStatus } from '../../common/enums/deployed-contract-status.enum';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { DeployedContractDto } from './dto/deployed-contract.dto';
import { mapDeployedContractDto } from './mappers/mapDeployedContractDto';
import { getState } from '../../helpers/rpc/rpc-helper';
import { UpdateDeployedContractDto } from './dto/update-deployed-contract.dto';

@Injectable()
export class DeployedContractService {
  private readonly logger = new Logger(DeployedContractService.name);

  constructor(
    @InjectModel(DeployedContract.name)
    private deployedContractRepo: Model<DeployedContractDocument>,
    @InjectModel(Project.name) private projectRepo: Model<ProjectDocument>,
    @InjectModel(Contract.name)
    private contractTemplateRepo: Model<ContractDocument>,
    private configService: ConfigService,
  ) {}

  async create(
    dto: CreateDeployedContractDto,
  ): Promise<ServiceResult<DeployedContract>> {
    try {
      if (!dto.alias) {
        return new BadRequest<DeployedContract>(`Alias can't be empty`);
      }

      if (!dto.contract_template_id) {
        return new BadRequest<DeployedContract>(`Contract uuid can't be empty`);
      }

      if (!Mongoose.Types.ObjectId.isValid(dto.contract_template_id)) {
        return new NotFound<DeployedContract>('Contract template not found');
      }

      if (!dto.args) {
        return new BadRequest<DeployedContract>(`Args can't be empty`);
      }

      if (!dto.project_id) {
        return new BadRequest<DeployedContract>(`Project id can't be empty`);
      }

      if (!Mongoose.Types.ObjectId.isValid(dto.project_id)) {
        return new NotFound<DeployedContract>('Project not found');
      }

      const project = await this.projectRepo
        .findOne({ _id: new Mongoose.Types.ObjectId(dto.project_id) })
        .exec();

      if (!project) {
        return new NotFound<DeployedContract>('Project not found');
      }

      const contract_template = await this.contractTemplateRepo
        .findOne({
          _id: new Mongoose.Types.ObjectId(dto.contract_template_id),
        })
        .exec();

      if (!contract_template) {
        return new NotFound<DeployedContract>('Contract template not found');
      }

      const aliasExists = await this.deployedContractRepo
        .exists({ owner: dto.owner, alias: dto.alias })
        .exec();

      if (aliasExists) {
        return new BadRequest<DeployedContract>(
          `Alias ${dto.alias} isn't unique`,
        );
      }

      const entity = {
        uuid: uuidv4(),
        alias: dto.alias,
        args: dto.args,
        project: project._id,
        contract_template: contract_template._id,
        tags: contract_template.tags,
        owner: dto.owner,
      };

      const deployedContract = await new this.deployedContractRepo(
        entity,
      ).save();

      return new ServiceResult<DeployedContract>(deployedContract);
    } catch (error) {
      this.logger.error('DeployedContractService - create', error);
      return new ServerError<DeployedContract>(
        `Can't create deployed contract`,
      );
    }
  }

  async findAll(
    ownerId: Mongoose.Types.ObjectId,
    offset?: number,
    limit?: number,
    project_id?: string,
    alias?: string,
    status?: DeployedContractStatus,
    tags?: string[],
  ): Promise<ServiceResult<PaginatedDto<DeployedContract>>> {
    try {
      const paginatedAggregate: any[] = [];
      const queryAnd: any = {
        $and: [],
      };

      queryAnd.$and.push({ owner: ownerId });

      if (project_id && Mongoose.Types.ObjectId.isValid(project_id)) {
        queryAnd.$and.push({
          project: new Mongoose.Types.ObjectId(project_id),
        });
      }

      if (alias) {
        queryAnd.$and.push({
          alias: { $regex: alias, $options: 'i' },
        });
      }

      if (status) {
        queryAnd.$and.push({
          status: { $regex: status, $options: 'i' },
        });
      }

      if (tags && tags.length > 0) {
        queryAnd.$and.push({ tags: { $in: tags } });
      }

      paginatedAggregate.push({ $match: queryAnd });

      if (offset) {
        paginatedAggregate.push({ $skip: Number(offset) });
      }

      if (limit) {
        paginatedAggregate.push({ $limit: Number(limit) });
      }

      const [{ paginatedResult, totalCount }] = await this.deployedContractRepo
        .aggregate([
          {
            $facet: {
              paginatedResult: paginatedAggregate,
              totalCount: [{ $match: queryAnd }, { $count: 'count' }],
            },
          },
        ])
        .exec();
      await this.deployedContractRepo.populate(paginatedResult, {
        path: 'contract_template',
      });

      return new ServiceResult<PaginatedDto<DeployedContract>>({
        total: totalCount.length > 0 ? totalCount[0].count : 0,
        count: paginatedResult.length,
        offset: offset ? Number(offset) : 0,
        limit: limit ? Number(limit) : 0,
        results: paginatedResult,
      });
    } catch (error) {
      this.logger.error('DeployedContractService - findAll', error);
      return new ServerError<PaginatedDto<DeployedContract>>(
        `Can't get deployed contracts`,
      );
    }
  }

  async findOne(
    uuid: string,
    ownerId: string,
  ): Promise<ServiceResult<DeployedContract>> {
    try {
      const deployedContract = await this.deployedContractRepo
        .findOne({ uuid })
        .populate('owner')
        .exec();

      if (!deployedContract) {
        return new NotFound<DeployedContract>('Deployed contract not found');
      }

      if (deployedContract.owner._id.toString() !== ownerId) {
        return new Unauthorized<DeployedContract>(
          'Unauthorized access to user deployed contract',
        );
      }

      if (
        deployedContract.txHash &&
        deployedContract.status === DeployedContractStatus.Pending
      ) {
        await this.updateTxStatus(
          deployedContract.txHash,
          deployedContract.deployer_address,
          deployedContract.uuid,
        );
      }
      return new ServiceResult<DeployedContract>(
        await this.deployedContractRepo
          .findOne({ uuid })
          .populate('contract_template')
          .populate('project')
          .populate('owner')
          .exec(),
      );
    } catch (error) {
      this.logger.error('DeployedContractService - findOne', error);
      return new ServerError<DeployedContract>(`Can't get deployed contract`);
    }
  }

  async findByUuid(uuid: string): Promise<ServiceResult<DeployedContractDto>> {
    try {
      const deployedContract = await this.deployedContractRepo
        .findOne({ uuid })
        .exec();

      if (!deployedContract) {
        return new NotFound<DeployedContractDto>('Deployed contract not found');
      }

      if (
        deployedContract.txHash &&
        deployedContract.status === DeployedContractStatus.Pending
      ) {
        await this.updateTxStatus(
          deployedContract.txHash,
          deployedContract.deployer_address,
          deployedContract.uuid,
        );
      }

      return new ServiceResult<DeployedContractDto>(
        mapDeployedContractDto(
          await this.deployedContractRepo
            .findOne({ uuid })
            .populate('contract_template')
            .populate({
              path: 'project',
              populate: { path: 'logo', model: 'File' },
            })
            .exec(),
        ),
      );
    } catch (error) {
      this.logger.error('DeployedContractService - findByUUid', error);
      return new ServerError<DeployedContractDto>(
        `Can't get deployed contract`,
      );
    }
  }

  async update(
    uuid: string,
    dto: UpdateDeployedContractDto,
  ): Promise<ServiceResult<DeployedContractDto>> {
    try {
      const updateDeployedContract = await this.deployedContractRepo
        .findOne({ uuid })
        .exec();

      if (!updateDeployedContract) {
        return new NotFound<DeployedContractDto>(
          'Deployment contract not found',
        );
      }

      if (updateDeployedContract.txHash) {
        return new BadRequest<DeployedContractDto>(
          'Deployment contract transaction already confirmed',
        );
      }

      updateDeployedContract.txHash = dto.txHash;
      updateDeployedContract.txDetails = dto.txDetails;
      updateDeployedContract.deployer_address = dto.deployer_address;
      updateDeployedContract.updatedAt = new Date();

      await this.deployedContractRepo.updateOne(
        { uuid },
        updateDeployedContract,
      );

      const updatedDeployedContract = await this.deployedContractRepo
        .findOne({ uuid })
        .populate('contract_template')
        .populate({
          path: 'project',
          populate: { path: 'logo', model: 'File' },
        })
        .exec();

      return new ServiceResult<DeployedContractDto>(
        mapDeployedContractDto(updatedDeployedContract),
      );
    } catch (error) {
      this.logger.error('TransactionRequestService - update', error);
      return new ServerError<DeployedContractDto>(
        `Can't update deployed contract`,
      );
    }
  }

  async remove(uuid: string, ownerId: string): Promise<ServiceResultEmpty> {
    try {
      const deployedContract = await this.deployedContractRepo
        .findOne({ uuid: uuid })
        .populate('owner')
        .exec();

      if (!deployedContract) {
        return new NotFound('Deployed contract not found');
      }

      if (deployedContract.owner._id.toString() !== ownerId) {
        return new Unauthorized(
          'Unauthorized access to user deployed contract',
        );
      }

      await this.deployedContractRepo
        .findByIdAndDelete(deployedContract._id)
        .exec();
      return new ServiceResultEmpty();
    } catch (error) {
      this.logger.error('DeployedContractService - remove', error);
      return new ServerError(`Can't remove deployed contract`);
    }
  }

  async updateAllTxStatuses(): Promise<void> {
    try {
      const deployedContracts = await this.deployedContractRepo
        .find({ status: DeployedContractStatus.Pending })
        .exec();

      for (const deployedContract of deployedContracts) {
        if (deployedContract.txHash && deployedContract.deployer_address) {
          await this.updateTxStatus(
            deployedContract.txHash,
            deployedContract.deployer_address,
            deployedContract.uuid,
          );
        }
      }
    } catch (error) {
      this.logger.error('DeployedContractService - updateAllTxStatuses', error);
    }
  }

  async updateTxStatus(
    txHash: string,
    deployer_address: string,
    uuid: string,
  ): Promise<void> {
    try {
      const txState = await getState(
        txHash,
        deployer_address,
        this.configService.get('NODE_ENV'),
      );
      await this.deployedContractRepo.updateOne(
        { uuid },
        {
          status: txState.status.hasOwnProperty('SuccessValue')
            ? DeployedContractStatus.Deployed
            : DeployedContractStatus.Failure,
        },
      );
    } catch (error) {
      this.logger.error('DeployedContractService - updateTxStatus', error);
    }
  }
}
