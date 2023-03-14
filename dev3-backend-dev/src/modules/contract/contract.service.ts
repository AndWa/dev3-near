import { Injectable, Logger } from '@nestjs/common';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { ServiceResult } from '../../helpers/response/result';
import { ServerError } from '../../helpers/response/errors';
import { ContractDto } from './dto/contract.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contract, ContractDocument } from './entities/contract.entity';
import { Model } from 'mongoose';
import { mapDtoToContract } from './mappers/map-dto-to-contract';
import {
  fetchApi,
  fetchRepo,
  githubApi,
  infoFileName,
  manifestFileName,
} from './constants';
import { GithubRepoDto } from './dto/github-repo.dto';
import { mapRepoToContractDto } from './mappers/map-repo-to-contract-dto';
import { GithubFileDto } from './dto/github-file.dto';
import { ContractManifestDto } from './dto/contract-manifest.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    @InjectModel(Contract.name) private repo: Model<ContractDocument>,
    private configService: ConfigService,
  ) {}

  github_token = this.configService.get<string>('github.token');
  branch =
    this.configService.get<string>('NODE_ENV') === 'dev' ||
    this.configService.get<string>('NODE_ENV') === 'staging'
      ? 'dev'
      : 'main';

  async findAll(
    offset?: number,
    limit?: number,
    name?: string,
    isAudited?: boolean,
  ): Promise<ServiceResult<PaginatedDto<ContractDto>>> {
    try {
      const paginatedAggregate: any[] = [];
      const totalCountQuery: any[] = [{ $count: 'count' }];
      const queryAnd: any = {
        $and: [],
      };

      if (name) {
        queryAnd.$and.push({
          name: { $regex: name, $options: 'i' },
        });
      }

      if (isAudited) {
        queryAnd.$and.push({ is_audited: isAudited });
      }

      if (queryAnd.$and.length > 0) {
        paginatedAggregate.push({ $match: queryAnd });
        totalCountQuery.push({ $match: queryAnd });
      }

      if (offset) {
        paginatedAggregate.push({ $skip: Number(offset) });
      }

      if (limit) {
        paginatedAggregate.push({ $limit: Number(limit) });
      }

      const [{ paginatedResult, totalCount }] = await this.repo
        .aggregate([
          {
            $facet: {
              paginatedResult: paginatedAggregate,
              totalCount: totalCountQuery,
            },
          },
        ])
        .exec();

      return new ServiceResult<PaginatedDto<ContractDto>>({
        total: totalCount.length > 0 ? totalCount[0].count : 0,
        count: paginatedResult.length,
        offset: offset ? Number(offset) : 0,
        limit: limit ? Number(limit) : 0,
        results: paginatedResult,
      });
    } catch (error) {
      this.logger.error('ContractService - findAll', error);
      return new ServerError<PaginatedDto<ContractDto>>(`Can't get contracts`);
    }
  }

  async saveContracts(): Promise<void> {
    try {
      const data = await fetchRepo(this.github_token, this.branch);
      const contracts = await this.getContracts(data);
      for (const contract of contracts) {
        const contractDb = await this.repo
          .findOne({ name: contract.name })
          .exec();

        if (contractDb) {
          const entity = mapDtoToContract(contractDb, contract);
          entity.updatedAt = new Date();
          await this.repo.updateOne({ _id: contractDb._id }, entity);
        } else {
          await new this.repo(contract).save();
        }
      }
    } catch (error) {
      this.logger.error('ContractService - saveContracts', error);
    }
  }

  async getContracts(data: GithubRepoDto): Promise<ContractDto[]> {
    try {
      const contracts: ContractDto[] = [];
      for (const node of data.repository.object.history.nodes) {
        for (const treeEntry of node.tree.entries) {
          if (treeEntry.object && treeEntry.object.entries) {
            for (const entry of treeEntry.object.entries) {
              if (entry.object && entry.object.entries) {
                for (const subEntry of entry.object.entries) {
                  if (subEntry.object && subEntry.object.entries) {
                    for (const subSubEntry of subEntry.object.entries) {
                      if (treeEntry.name && entry.name && subSubEntry.name) {
                        const contract = await this.getContract(
                          treeEntry.name,
                          entry.name,
                          subEntry.name,
                        );
                        contracts.push(contract);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return contracts;
    } catch (error) {
      this.logger.error('ContractService - getContracts', error);
    }
  }

  async getContract(
    treeEntryName: string,
    entryName: string,
    subEntryName: string,
  ) {
    try {
      const githubManifestFileDto = await this.getFileInfo<GithubFileDto>(
        treeEntryName,
        entryName,
        subEntryName,
        manifestFileName,
      );

      const manifestDto = await fetchApi<ContractManifestDto>(
        this.github_token,
        githubManifestFileDto.download_url,
      );

      const githubInfoFileDto = await this.getFileInfo<GithubFileDto>(
        treeEntryName,
        entryName,
        subEntryName,
        infoFileName,
      );

      return mapRepoToContractDto(
        manifestDto,
        githubManifestFileDto._links.html,
        entryName,
        githubInfoFileDto.download_url ? githubInfoFileDto.download_url : '',
      );
    } catch (error) {
      this.logger.error('ContractService - getContract', error);
    }
  }

  async getFileInfo<T>(
    root: string,
    contractOwner: string,
    contractType: string,
    fileName: string,
  ): Promise<T> {
    const data = await fetchApi<T>(
      this.github_token,
      `${githubApi}/${root}/${contractOwner}/${contractType}/${fileName}?ref=${this.branch}`,
    );

    return data;
  }
}
