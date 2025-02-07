import config from '@server/config';
import {
  S3Client,
  PutObjectCommand,
  StorageClass,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const s3 = new S3Client({
  region: config.s3.region,
  endpoint: `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com`,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

export async function uploadImage(filePath: string, key: string): Promise<string> {
  try {
    const fileStream = fs.createReadStream(filePath);

    const params = {
      Bucket: config.s3.bucketName,
      Key: key,
      Body: fileStream,
      ContentType: 'image/jpg',
      CacheControl: 'max-age=31536000, public',
      StorageClass: StorageClass.STANDARD,
    };

    await s3.send(new PutObjectCommand(params));

    return `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    return '';
  }
}

export async function uploadAllImages(directory: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(directory);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    const uploadPromises = imageFiles.map(async (file) => {
      const filePath = path.join(directory, file);
      return await uploadImage(filePath, file);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images from directory:', error);
    return [];
  }
}
