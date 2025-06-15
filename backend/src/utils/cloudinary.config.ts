import cloudinary from 'cloudinary';
import { Readable } from 'stream';

// تكوين Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * تحويل البُuffer إلى تيار لرفعه إلى Cloudinary
 */
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null); // نهاية التيار
  return readable;
}

/**
 * رفع الصورة إلى Cloudinary
 */
export async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'fishchain-products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result!.secure_url); // URL النهائي للصورة
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
}