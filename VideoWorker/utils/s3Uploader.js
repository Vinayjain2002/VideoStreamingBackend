import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

// Initialize the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export const uploadToS3 = async (filename, fileBuffer) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `videos/${filename}`,
      Body: Buffer.from(fileBuffer, "base64"),
      ContentType: "video/mp4",
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log(`✅ Successfully uploaded ${filename} to S3`);
  } catch (error) {
    console.error("🚨 S3 Upload Error:", error);
  }
};
