require("dotenv").config();
const e = require("express");
const { s3 } = require("./aws.helper");

const randomString = (number) => {
  return Math.random()
    .toString(36)
    .substring(2, number + 2);
};

const FILE_TYPE_MATCH = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const uploadFile = async (file) => {
  if (FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
    throw new Error("File type not match");
  }

  const fileName = `${randomString(10)}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("Upload file success", data);
    return data.Location;
  } catch (error) {
    console.log("Error uploadFile", error);
    throw error;
  }
};

const deleteFile = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  try {
    const data = await s3.deleteObject(params).promise();
    console.log("Delete file success", data);
    return data;
  } catch (error) {
    console.log("Error deleteFile", error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
