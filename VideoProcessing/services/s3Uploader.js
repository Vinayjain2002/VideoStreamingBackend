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
  if(!Buffer.isBuffer(fileBuffer)){
    throw new Error("Invalid File Buffer: Expected A Buffer");
  }

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentLength:fileBuffer.length,
    ContentType: "video/mp4",
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Construct the S3 file URL
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    
    console.log(`File uploaded successfully: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error("Error uploading file to S3:", error.message);
    throw error; // Re-throw the error for better error handling
  }
};

testS3Connection();