import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs, { stat } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.AWS_REGION);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


async function testS3Connection() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    console.log("Successfully connected to AWS S3. Buckets:", response.Buckets);
  } catch (error) {
    console.error("Error connecting to AWS S3:", error.message);
  }
}


export const uploadToS3 = async (filename, fileBuffer) => {
  if (!Buffer.isBuffer(fileBuffer)) {
    throw new Error("Invalid File Buffer: Expected A Buffer");
  }

  let contentType = 'application/octet-stream'; // Default
  if (filename.endsWith('.m3u8')) {
    contentType = 'application/vnd.apple.mpegurl';
  } else if (filename.endsWith('.ts')) {
    contentType = 'video/mp2t';
  }

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentLength: fileBuffer.length,
    ContentType: contentType, // Dynamically set Content-Type
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Construct the S3 file URL
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    console.log(`File uploaded successfully: ${s3Url} (Content-Type: ${contentType})`);
    return s3Url;
  } catch (error) {
    console.error("Error uploading file to S3:", error.message);
    throw error; // Re-throw the error for better error handling
  }
};

testS3Connection();