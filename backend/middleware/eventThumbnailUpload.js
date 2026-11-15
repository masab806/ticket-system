const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads", "events");
const extensionsByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
        callback(error, uploadDirectory);
      });
    },
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${extensionsByMimeType[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!extensionsByMimeType[file.mimetype]) {
      return callback(new Error("Thumbnail must be a JPEG, PNG, or WebP image"));
    }
    callback(null, true);
  },
});

const uploadEventThumbnail = (req, res, next) => {
  upload.single("thumbnail")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.code === "LIMIT_FILE_SIZE"
          ? "Thumbnail must be 5 MB or smaller"
          : error.message,
      });
    }
    next();
  });
};

module.exports = { uploadEventThumbnail };
