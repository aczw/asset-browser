import { 
    S3Client,
    ListBucketsCommand
 } from "@aws-sdk/client-s3";

const S3 = new S3Client({
    region: "auto",
    endpoint: import.meta.env.R2_URL,
    credentials: {
        accessKeyId: import.meta.env.ACCESS_KEY,
        secretAccessKey: import.meta.env.SECRET_KEY,
    },
});

console.log(await S3.send(new ListBucketsCommand({})));