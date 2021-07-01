import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // @ts-ignore
    // another 'annoying' error from TS, though I am pretty sure this code
    // is probably correct (according to the docs) & most importantly, it works!
    folder: 'yelpcamp',
    allowed_formats: ['jpeg', 'jpg', 'png']
  }
})

export { cloudinary, storage }
