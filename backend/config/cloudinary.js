const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images (thumbnails, avatars)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studenthub/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
  },
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studenthub/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'webm'],
  },
});

// Storage for PDFs/documents
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studenthub/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports = { cloudinary, uploadImage, uploadVideo, uploadDocument };
