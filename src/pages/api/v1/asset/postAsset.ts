import { 
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand
 } from "@aws-sdk/client-s3";

import fs from "fs";
import multer from "multer";

import type { APIRoute } from "astro";

const upload = multer({ dest: "uploads/" });
const S3 = new S3Client({
    region: "auto",
    endpoint: import.meta.env.R2_URL,
    credentials: {
        accessKeyId: import.meta.env.ACCESS_KEY,
        secretAccessKey: import.meta.env.SECRET_KEY,
    },
});

// given an assetName, it will return the bucket
// test url:
// http://localhost:4321/api/v1/asset/getAssets?bucket=7000assets&key=cartoonFish
const POST: APIRoute = async ({ url }) => {
    try {
        const bucket = url.searchParams.get("bucket");
        const key = url.searchParams.get("key") + "/";
        const fileStream = fs.createReadStream(url.searchParams.get("filePath") as string);

        const params = {
            Bucket: bucket as string,
            Key: key,
            Body: fileStream
        }

        const command = new PutObjectCommand(params);
        
        await S3.send(command);
        return new Response(
            "uploaded a file",
            {
                status: 200
            }
        );

    } catch (error)  {
        console.log(error);
        const statusText = "bad";
        return new Response(statusText, {
            status: 404,
            statusText,
        });
    }
}

export { POST };