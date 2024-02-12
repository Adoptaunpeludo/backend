import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Request } from 'express';
import multer, { Multer } from 'multer';
import multerS3 from 'multer-s3';
import util from 'util';
import { BadRequestError } from '../../domain';

export class S3Service {
  private s3: S3Client;

  constructor(
    private readonly region: string,
    private readonly accessKeyId: string,
    private readonly secretAccessKey: string,
    private readonly bucket: string
  ) {
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  private multerStorage(folder: string) {
    const storage = multerS3({
      s3: this.s3,
      acl: 'public-read',
      bucket: this.bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req: Request, file, cb) => {
        console.log({ file });
        const fileName = `${folder}/${req.user.id}/${req.user.name}_${file.originalname}`;
        cb(null, fileName);
      },
    });

    return storage;
  }

  private checkFileType(
    req: Request,
    file: Express.MulterS3.File,
    cb: multer.FileFilterCallback
  ) {
    if (!file.mimetype.startsWith('image/'))
      return cb(new BadRequestError('Invalid file type: ' + file.mimetype));

    cb(null, true);
  }

  private checkFilesType(
    req: Request,
    files: Express.MulterS3.File[],
    cb: multer.FileFilterCallback
  ) {
    files.forEach((file) => this.checkFileType(req, file, cb));
  }

  public uploadSingle(folder: string) {
    const storage = this.multerStorage(folder);

    let uploadSingleFile = multer({
      storage,
      limits: { fileSize: 1024 * 1024 * 3 },
      fileFilter: this.checkFileType,
    }).single('avatar');

    return util.promisify(uploadSingleFile);
  }

  public uploadMultiple(folder: string) {
    const storage = this.multerStorage(folder);
    let uploadMultipleFiles = multer({
      storage,
      limits: { fileSize: 1024 * 1024 * 3 },
      fileFilter: this.checkFileType,
    }).array('images');

    return util.promisify(uploadMultipleFiles);
  }

  public async deleteFile(file: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: file,
    });

    const response = await this.s3.send(command);

    return response;
  }

  public async deleteFiles(files: string[]) {
    const objects = files.map((file) => ({
      Key: file,
    }));

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: objects,
      },
    });

    const response = await this.s3.send(command);

    return response;
  }
}
