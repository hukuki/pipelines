import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandInput, ListObjectsV2Command } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "eu-central-1";

const s3Client = new S3Client({ region });

const uploadFile = async ({ bucket, filename, content }: { bucket: string, filename: string, content: string }) => {
    // call S3 to retrieve upload file to specified bucket
    const uploadParams = {
        Bucket: bucket,
        Key: filename,
        Body: content,
    };

    try {
        const command = new PutObjectCommand(uploadParams)
        const results = await s3Client.send(command);
        
        return results;
    } catch (err) {
        console.log("Error:", err);
        console.log("Filename:", filename);
        console.log("File:", content);
    }
};

const getFile = async ({ bucket, filename }: { bucket: string, filename: string }) => {
    // call S3 to retrieve upload file to specified bucket
    const getParams: GetObjectCommandInput = {
        Bucket: bucket,
        Key: filename,
    };

    try {
        const command = new GetObjectCommand(getParams);
        const results = await s3Client.send(command);

        const str = await results.Body?.transformToString() || "";
        return Buffer.from(str);
    } catch (err) {
        console.log("Error:", err);
        console.log("Filename:", filename);
    }
};

const listFolder = async ({ bucket, folder, continuationToken }: { bucket: string, folder: string, continuationToken?: string | undefined }) => {
    // call S3 to retrieve upload file to specified bucket
    try{
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: folder,
            ContinuationToken: continuationToken,
        });

        const results = await s3Client.send(command);
        return results;
    }catch(err){
        console.log("Error:", err);
        console.log("Directory:", folder);
    }

    return undefined;
};

export { uploadFile, getFile, listFolder };