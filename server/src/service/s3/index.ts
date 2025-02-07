import config from '@server/config';
import { S3 } from 'aws-sdk';

const signedUrlExpireSeconds = 60 * 1;

const s3 = new S3({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
  region: config.s3.region,
  signatureVersion: 'v4',
});

export const getSignedUrl = (key: string, expires: number = signedUrlExpireSeconds): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: config.s3.bucketName,
    Key: key,
    Expires: expires,
  });
};
