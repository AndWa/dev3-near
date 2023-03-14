import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import {
  BadRequest,
  NotFound,
  ServerError,
} from '../../helpers/response/errors';
import { ServiceResult } from '../../helpers/response/result';
import { DeployedContractService } from '../deployed-contract/deployed-contract.service';
import { TransactionRequestService } from '../transaction-request/transaction-request.service';
import { CronJobDto } from './dto/cron-job.dto';
import { mapCronToDto } from './mappers/mapCronToDto';

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly transactionRequestService: TransactionRequestService,
    private readonly deployedContractService: DeployedContractService,
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    try {
      // every 5 minutes
      const updateTxStatusesJob = new CronJob(
        `0 */5 * * * *`,
        async () => {
          await this.transactionRequestService.updateAllTxStatuses();
          await this.deployedContractService.updateAllTxStatuses();
        },
        () => {
          this.logger.warn(
            `job updateTxStatusesCron finished ${new Date().toJSON()}`,
          );
        },
        false,
      );
      this.schedulerRegistry.addCronJob(
        'updateTxStatusesCron',
        updateTxStatusesJob,
      );

      if (this.configService.get('start_cron_jobs') === 'true') {
        updateTxStatusesJob.start();
        this.logger.warn(
          `job updateTxStatusesCron added with cron time 0 */5 * * * *`,
        );
      }
    } catch (error) {
      this.logger.error('TaskService - onModuleInit', error);
    }
  }

  async startCronJob(
    name: string,
    start: boolean,
  ): Promise<ServiceResult<boolean>> {
    try {
      const job = this.schedulerRegistry.getCronJob(name);

      if (!job) {
        return new NotFound<boolean>('Cron job not found!');
      }

      if (job.running) {
        if (start) {
          return new BadRequest<boolean>(`job ${name} already running!`);
        } else {
          job.stop();
          this.logger.warn(`job ${name} stopped!`);
        }
      } else if (!job.running) {
        if (start) {
          job.start();
          this.logger.warn(`job ${name} started!`);
        } else {
          return new BadRequest<boolean>(`job ${name} already stopped!`);
        }
      }

      return new ServiceResult<boolean>(true);
    } catch (error) {
      this.logger.error('TaskService - addCronJob', error);
      return new ServerError<boolean>(`Can't update transaction request`);
    }
  }

  setCronJobTime(name: string, cronTime: string): ServiceResult<boolean> {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (!job) {
        return new NotFound<boolean>('Cron job not found!');
      }
      job.stop();
      job.setTime(new CronTime(cronTime));
      job.start();
      return new ServiceResult<boolean>(true);
    } catch (error) {
      this.logger.error('TaskService - setCronJobTime', error);
      return new ServerError<boolean>(`Can't get cron job`);
    }
  }

  getCrons(): ServiceResult<CronJobDto[]> {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      const cronJobs: CronJobDto[] = [];
      jobs.forEach((value, key) => {
        cronJobs.push(mapCronToDto(value, key));
      });
      return new ServiceResult<CronJobDto[]>(cronJobs);
    } catch (error) {
      this.logger.error('TaskService - getCrons', error);
      return new ServerError<CronJobDto[]>(`Can't get cron jobs`);
    }
  }

  getCronJob(name: string): ServiceResult<CronJobDto> {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (!job) {
        return new NotFound<CronJobDto>('Cron job not found!');
      }
      return new ServiceResult<CronJobDto>(mapCronToDto(job, name));
    } catch (error) {
      this.logger.error('TaskService - getCrons', error);
      return new ServerError<CronJobDto>(`Can't get cron job`);
    }
  }
}
