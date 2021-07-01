import { ValidationErrorItem } from 'joi'
import { Request, Response, NextFunction } from 'express'
import { Campground } from './models/campground'
import { Review } from './models/review'
import { campgroundSchema, reviewSchema } from './schemas'
import { ExpressError } from './utils/express-error'

// declaring additional property into the session object
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html
declare module 'express-session' {
  interface SessionData {
    returnTo: string
  }
}

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    // console.log(req.session)
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You must be signed in first!')
    return res.redirect('/login')
  }
  next()
}

export const isCampgroundAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (campground && !campground.author.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You are not authorized to do that action!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

export const isReviewAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (review && !review.author.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You are not authorized to do that action!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

export const validateCampground = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    // console.log(error)
    const msg = error.details
      .map((el: ValidationErrorItem) => el.message)
      .join(',')
    throw new ExpressError(msg, 400)
  }
  next()
}

export const validateReview = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details
      .map((el: ValidationErrorItem) => el.message)
      .join(',')
    throw new ExpressError(msg, 400)
  }
  next()
}
