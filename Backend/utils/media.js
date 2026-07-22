const { cloudinary, configureCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const validateImage = (file) => {
  if (!file) throw new Error('Debes seleccionar una imagen');
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) throw new Error('Solo se permiten imágenes JPG, PNG o WEBP');
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar 5 MB');
};

const uploadImage = async (file, folder) => {
  validateImage(file);
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary no está configurado en Backend/.env');
    error.status = 503;
    throw error;
  }
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }),
    );
    stream.end(file.data);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage, validateImage };
