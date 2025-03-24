import { 
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand
 } from "@aws-sdk/client-s3";

import type { APIRoute } from "astro";

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
const GET: APIRoute = async ({ url }) => {
    try {
        const bucket = url.searchParams.get("bucket");
        const key = url.searchParams.get("key") + "/";
        
        const command = new ListObjectsV2Command({ 
            Bucket: bucket as string,
            Prefix: key,
            Delimiter: "/"
        });

        const response = await S3.send(command);
        const files = response.Contents?.map(obj => obj.Key) || [];

        return new Response(
            JSON.stringify({ files }),
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

export { GET };