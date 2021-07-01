import { Router } from 'express'
import { isLoggedIn, isReviewAuthor, validateReview } from '../middlewares'
import { catchAsync } from '../utils/catch-async'
import { createReview, deleteReview } from '../controllers/review'

// mergeParams: true -> merging the params from the other
// routes with the params from inside this route (s48v2)
const router = Router({ mergeParams: true })

router.post('/', isLoggedIn, validateReview, catchAsync(createReview))

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(deleteReview)
)

export { router as reviewRouter }
