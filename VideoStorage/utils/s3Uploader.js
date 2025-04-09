import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Connection() {
  try {
    const data = await s3.listBuckets({});
    console.log('Successfully connected to AWS S3 in region:', process.env.AWS_REGION);
  } catch (error) {
    console.error('Error connecting to AWS S3:', error.message);
  }
}

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
testS3Connection();