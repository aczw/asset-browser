import { 
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command
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

const GET: APIRoute = async ({url}) => {
    try {
        const response = await S3.send(new ListObjectsV2Command({ Bucket: "7000assets" }));
        return new Response(
            await JSON.stringify(response)
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