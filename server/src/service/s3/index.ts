import config from '@server/config'
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  StorageClass,
} from '@aws-sdk/client-s3'
import fs from 'fs'

const s3 = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
})

export async function uploadImage(filePath: string, key: string) {
  try {
    const fileStream = fs.createReadStream(filePath)

    const params = {
      Bucket: config.s3.bucketName,
      Key: key,
      Body: fileStream,
      ContentType: 'image/jpg',
      ACL: ObjectCannedACL.public_read,
      CacheControl: 'max-age=31536000, public',
      StorageClass: StorageClass.STANDARD,
    }

    await s3.send(new PutObjectCommand(params))

    return `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading image:', error)
    return ''
  }
}
