import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.resolve("uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg","image/png","image/webp","image/gif",]);

const allowedExtensions = new Set([".jpg",".jpeg",".png",".webp",".gif",]);

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDir);
},

filename: (req, file, cb) => {
const extension = path.extname(file.originalname).toLowerCase();
cb(null, `${crypto.randomUUID()}${extension}`);
},
});

const fileFilter = (req, file, cb) => {
const extension = path.extname(file.originalname).toLowerCase();

if (!allowedMimeTypes.has(file.mimetype) ||!allowedExtensions.has(extension)) {
const error = new Error(
"image must be jpg, jpeg, png, webp or gif",
);
error.code = "INVALID_IMAGE_TYPE";
return cb(error);
}
cb(null, true);
};

const multerUpload = multer({storage,fileFilter,limits: {fileSize: 5 * 1024 * 1024,files: 1,},});

export function uploadImage(field) {
return (req, res, next) => {
multerUpload.single(field)(req, res, (error) => {
if (!error) {
return next();
}
  let message = "failed to upload image";

  if (error.code === "LIMIT_FILE_SIZE") {
    message = "image must be smaller than 5MB";
  } else if (error.code === "LIMIT_UNEXPECTED_FILE" ||error.code === "LIMIT_FILE_COUNT") {
    message = "only one image is allowed";
  } else if (error.code === "INVALID_IMAGE_TYPE") {
    message = error.message;
  }

  if (
    error instanceof multer.MulterError ||error.code === "INVALID_IMAGE_TYPE") {
    return res.status(422).json({
      errors: {
        image: {
          errors: [message],
        },
      },
    });
  }
  return next(error);
});
};
}
