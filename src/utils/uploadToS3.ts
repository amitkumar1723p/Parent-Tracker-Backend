import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string | null> => {
    if (!file) return null;

    const fileExt = path.extname(file.originalname);
    const fileName = `profile_${Date.now()}${fileExt}`;
    const Key = `${process.env.S3_FOLDER}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
};
