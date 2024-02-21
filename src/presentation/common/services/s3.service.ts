import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import util from 'util';
import { BadRequestError } from '../../../domain';

/**
 * S3Service class handles interactions with AWS S3 bucket including file uploads and deletions.
 */
export class S3Service {
  private s3: S3Client;

  /**
   * Constructs an instance of S3Service.
   * @param region - AWS region where the S3 bucket is located.
   * @param accessKeyId - Access key ID for AWS credentials.
   * @param secretAccessKey - Secret access key for AWS credentials.
   * @param bucket - Name of the S3 bucket.
   */
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

  /**
   * Creates multer storage configuration for uploading files to S3.
   * @param folder - Folder in the bucket where the file will be stored.
   * @param id - ID used to identify the file.
   * @param name - Name of the file.
   * @returns Multer storage configuration.
   */
  private multerStorage(folder: string, id: string, name: string) {
    const storage = multerS3({
      s3: this.s3,
      acl: 'public-read',
      bucket: this.bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req: Request, file, cb) => {
        const fileName = `${folder}/${id}/${name}_${file.originalname}`;
        cb(null, fileName);
      },
    });

    return storage;
  }

  /**
   * Checks if the uploaded file has a valid image MIME type.
   * @param _req - Express request object.
   * @param file - Uploaded file object.
   * @param cb - Multer callback function.
   */
  public checkFileType(
    _req: Request,
    file: Express.MulterS3.File,
    cb: multer.FileFilterCallback
  ) {
    if (!file.mimetype.startsWith('image/'))
      return cb(new BadRequestError('Invalid file type: ' + file.mimetype));

    cb(null, true);
  }

  // public uploadSingle(folder: string, id: string, name: string) {
  //   const storage = this.multerStorage(folder, id, name);

  //   let uploadSingleFile = multer({
  //     storage,
  //     limits: { fileSize: 1024 * 1024 * 3 },
  //     fileFilter: this.checkFileType,
  //   }).single('avatar');

  //   return util.promisify(uploadSingleFile);
  // }

  /**
   * Uploads multiple files to the S3 bucket.
   * @param folder - Folder in the bucket where the files will be stored.
   * @param id - ID used to identify the files.
   * @param name - Name of the files.
   * @returns Promise of a function to upload multiple files.
   */
  public uploadMultiple(folder: string, id: string, name: string) {
    const storage = this.multerStorage(folder, id, name);
    let uploadMultipleFiles = multer({
      storage,
      limits: { fileSize: 1024 * 1024 * 3 },
      fileFilter: this.checkFileType,
    }).array('images');

    return util.promisify(uploadMultipleFiles);
  }

  /**
   * Deletes a single file from the S3 bucket.
   * @param file - Key of the file to be deleted.
   * @returns Promise of the deletion response.
   */
  public async deleteFile(file: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: file,
    });

    const response = await this.s3.send(command);

    return response;
  }

  /**
   * Deletes multiple files from the S3 bucket.
   * @param files - Array of keys of files to be deleted.
   * @returns Promise of the deletion response.
   */
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
