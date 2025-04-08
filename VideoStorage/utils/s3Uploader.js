import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (filename, fileBuffer) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: "video/mp4",
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);
};