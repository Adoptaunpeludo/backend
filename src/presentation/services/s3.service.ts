import { S3Client } from '@aws-sdk/client-s3';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import util from 'util';

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
        const fileName = `${folder}/${req.user.id}/${req.user.name}_${file.originalname}`;
        cb(null, fileName);
      },
    });

    return storage;
  }

  public uploadSingle(folder: string) {
    const storage = this.multerStorage(folder);

    let uploadSingleFile = multer({
      storage,
    }).single('avatar');

    return util.promisify(uploadSingleFile);
  }
}
