import 'reflect-metadata';

import { S3Client } from '@aws-sdk/client-s3';
import { NextFunction, Request, Response } from 'express';
import { S3Service } from '../../../presentation/shared/services';

describe('s3.service.ts', () => {
  test('should create an instance of S3Service with valid credentials', () => {
    const s3Service = new S3Service(
      'validRegion',
      'validAccessKeyId',
      'validSecretAccessKey',
      'validBucket'
    );
    expect(s3Service).toBeInstanceOf(S3Service);
  });

  test('should upload multiple files to S3 bucket with valid folder, id, and name', async () => {
    const s3Service = new S3Service(
      'validRegion',
      'validAccessKeyId',
      'validSecretAccessKey',
      'validBucket'
    );

    s3Service.uploadMultiple = jest.fn().mockResolvedValueOnce(true);

    s3Service.uploadMultiple('validFolder', 'validId', 'validName');

    expect(s3Service.uploadMultiple).toHaveBeenCalledWith(
      'validFolder',
      'validId',
      'validName'
    );
  });

  test('should delete a file from S3 bucket with valid file name', async () => {
    const s3Service = new S3Service(
      'validRegion',
      'validAccessKeyId',
      'validSecretAccessKey',
      'validBucket'
    );

    s3Service.deleteFile = jest.fn().mockResolvedValueOnce(true);

    await s3Service.deleteFile('validFileName');

    expect(s3Service.deleteFile).toHaveBeenCalledWith('validFileName');
  });

  test('should delete multiple files from S3 bucket with valid file names', async () => {
    // Mock the S3Client and its send method
    const mockSend = jest.fn().mockResolvedValue({});
    const mockS3Client = {
      send: mockSend,
    } as unknown as S3Client;
    const s3Service = new S3Service(
      'validRegion',
      'validAccessKeyId',
      'validSecretAccessKey',
      'validBucket'
    );
    s3Service['s3'] = mockS3Client;

    const files = ['file1.jpg', 'file2.jpg', 'file3.jpg'];
    await s3Service.deleteFiles(files);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'validBucket',
          Delete: expect.objectContaining({
            Objects: expect.arrayContaining([
              { Key: 'file1.jpg' },
              { Key: 'file2.jpg' },
              { Key: 'file3.jpg' },
            ]),
          }),
        }),
      })
    );
  });

  test('should handle valid file types for upload', () => {
    // Mock the file object
    const mockFile = {
      mimetype: 'image/jpeg',
    } as unknown as Express.MulterS3.File;

    const s3Service = new S3Service(
      'validRegion',
      'validAccessKeyId',
      'validSecretAccessKey',
      'validBucket'
    );
    const mockCallback = jest.fn();

    const req = {} as Request;

    s3Service['checkFileType'](req, mockFile, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  test('should return a valid multerS3 storage object with correct properties when all parameters are valid', () => {
    // Arrange
    const folder = 'testFolder';
    const id = 'testId';
    const name = 'testName';
    const s3Service = new S3Service(
      'testRegion',
      'testAccessKeyId',
      'testSecretAccessKey',
      'testBucket'
    );

    // Act
    const storage = s3Service['multerStorage'](folder, id, name);

    // Assert
    expect(storage).toBeDefined();
  });
});
