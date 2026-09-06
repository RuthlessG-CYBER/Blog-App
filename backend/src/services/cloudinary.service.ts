import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const uploadImage = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    // Remove file from local server after upload
    fs.unlinkSync(filePath);
    return {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw { statusCode: 500, message: 'Image upload failed' };
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw { statusCode: 500, message: 'Image deletion failed' };
  }
};
