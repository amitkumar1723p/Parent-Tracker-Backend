"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const uploadToS3 = async (file) => {
    if (!file)
        return null;
    const fileExt = path_1.default.extname(file.originalname);
    const fileName = `profile_${Date.now()}${fileExt}`;
    const Key = `${process.env.S3_FOLDER}/${fileName}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    await s3.send(command);
    return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
};
exports.uploadToS3 = uploadToS3;
