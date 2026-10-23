const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Cloudinary storage configuration for menu items
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chocolate-clicks/menu",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 900, crop: "limit" }],
  },
});

const uploadMenuImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, and WEBP image files are allowed"), false);
    }
  },
});

module.exports = {
  cloudinary,
  uploadMenuImage,
};
