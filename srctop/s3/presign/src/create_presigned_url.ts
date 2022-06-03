import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

// Set the AWS Region.
const REGION = "us-east-1";
const BUCKET_NAME = "random-quotes-demo";
const FILE_NAME = "my.mp3";

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });
let KEY_PREFIX = "transcribe/audio/" + FILE_NAME;
let putObjectParam: PutObjectCommandInput = {
  Bucket: BUCKET_NAME,
  Key: KEY_PREFIX,
};

const command = new PutObjectCommand(putObjectParam);
getSignedUrl(s3Client, command, { expiresIn: 3600 }).then((a) => {
  console.log(a);
});

console.log(
  "Run the command   curl -v --upload-file <LOCAL_FILE> <PRESIGNED_URL"
);
