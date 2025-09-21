import { S3 } from 'aws-sdk';

export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const result = await this.s3.getObject(params).promise();
    return result.Body as Buffer;
  }

  async uploadFile(bucket: string, key: string, body: Buffer, contentType: string): Promise<string> {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    await this.s3.upload(params).promise();
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  async generatePresignedUrl(bucket: string, key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Expires: 3600, // 1 hour
    };

    return this.s3.getSignedUrl('putObject', params);
  }
}
