import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: any,
) => {
  const fileExtension = file.mimetype.split('/')[1];
  const validFiles = ['jpg', 'jpeg', 'png'];
  if (validFiles.some((el) => fileExtension.includes(el)))
    return callback(null, true);
  return callback(
    new HttpException(`Not valid file type`, HttpStatus.UNPROCESSABLE_ENTITY),
    false,
  );
};
