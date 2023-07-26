const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

export { uploadFile };