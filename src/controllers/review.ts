import { Request, Response } from 'express'
import { Campground } from '../models/campground'
import { Review } from '../models/review'

export const createReview = async (req: Request, res: Response) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground) {
    req.flash('error', 'The campground is missing')
    return res.redirect('/campgrounds')
  }

  const review = Review.build(req.body.review)
  review.author = res.locals.currentUser._id
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash('success', 'Successfully made a new review')
  res.redirect(`/campgrounds/${campground._id}`)
}

export const deleteReview = async (req: Request, res: Response) => {
  const { id, reviewId } = req.params
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'Successfully deleted a review')
  res.redirect(`/campgrounds/${id}`)
}
