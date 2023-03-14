import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { S3 } from 'aws-sdk';
import Mongoose, { Model } from 'mongoose';
import { ServiceResult } from '../../helpers/response/result';
import { v4 as uuid } from 'uuid';
import { FileDocument, File } from './entities/file.entity';
import {
  NotFound,
  ServerError,
  Unauthorized,
} from '../../helpers/response/errors';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    @InjectModel(File.name) private repo: Model<FileDocument>,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    ownerId: Mongoose.Types.ObjectId,
    dataBuffer: Buffer,
    fileName: string,
    mimetype: string,
  ): Promise<ServiceResult<File>> {
    try {
      const s3 = this.getS3();
      const params = {
        Bucket: this.configService.get('aws.bucket_name'),
        Key: `${uuid()}`,
        Body: dataBuffer,
        ACL: 'public-read',
        ContentType: mimetype,
        ContentDisposition: 'inline',
        CreateBucketConfiguration: {
          LocationConstraint: this.configService.get('aws.region'),
        },
      };

      const uploadResult = await s3.upload(params).promise();

      const file = await new this.repo({
        name: fileName,
        url: uploadResult.Location,
        key: uploadResult.Key,
        mime_type: mimetype,
        owner: ownerId,
      }).save();

      return new ServiceResult<File>(file);
    } catch (error) {
      this.logger.error('FileService - upload', error);
      return new ServerError<File>(`Can't upload file`);
    }
  }

  async putFile(
    ownerId: string,
    id: string,
    dataBuffer: Buffer,
    fileName: string,
    mimetype: string,
  ): Promise<ServiceResult<File>> {
    try {
      if (!Mongoose.Types.ObjectId.isValid(id)) {
        return new NotFound<File>('File not found');
      }

      const file = await this.repo
        .findOne({ _id: new Mongoose.Types.ObjectId(id) })
        .populate('owner')
        .exec();

      if (!file) {
        return new NotFound<File>('File not found');
      }

      if (file.owner._id.toString() !== ownerId) {
        return new Unauthorized<File>('Unauthorized access to user file');
      }

      const s3 = this.getS3();
      const params = {
        Bucket: this.configService.get('aws.bucket_name'),
        Key: file.key,
        Body: dataBuffer,
        ACL: 'public-read',
        ContentType: file.mime_type,
        ContentDisposition: 'inline',
      };

      await s3.putObject(params).promise();
      file.name = fileName;
      file.mime_type = mimetype;
      file.updatedAt = new Date();
      await this.repo.updateOne({ _id: file.id }, file);

      const updatedFile = await this.repo
        .findOne({ _id: new Mongoose.Types.ObjectId(id) })
        .populate('owner')
        .exec();

      return new ServiceResult<File>(updatedFile);
    } catch (error) {
      this.logger.error('FileService - update file', error);
      return new ServerError<File>(`Can't update file`);
    }
  }

  getS3() {
    return new S3({
      accessKeyId: this.configService.get('aws.access_key'),
      secretAccessKey: this.configService.get('aws.secret_key'),
    });
  }
}
