import { Router } from 'express'
import multer from 'multer' // another option is to use formidable
import { catchAsync } from '../utils/catch-async'
import { storage } from '../cloudinary'
import { isCampgroundAuthor, isLoggedIn, validateCampground } from '../middlewares'
import {
  campgroundIndex,
  createCampground,
  deleteCampground,
  renderEditCampgroundForm,
  renderNewCampgroundForm,
  showCampground,
  updateCampground
} from '../controllers/campground'

const upload = multer({ storage })

const router = Router()

router
  .route('/')
  .get(catchAsync(campgroundIndex))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(createCampground))

router.get('/new', isLoggedIn, catchAsync(renderNewCampgroundForm))

router
  .route('/:id')
  .get(catchAsync(showCampground))
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(updateCampground)
  )
  .delete(isLoggedIn, isCampgroundAuthor, catchAsync(deleteCampground))

router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(renderEditCampgroundForm))

export { router as campgroundRouter }
