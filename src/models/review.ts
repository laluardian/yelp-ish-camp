import { Model, model, Document, Schema } from 'mongoose'
import { UserDoc } from './user'

// an interface that describes the properties
// that are required to create a new review
interface ReviewAttrs {
  body: string
  rating: number
  author: UserDoc
}

// an interface that describes the properties
// that a review document has
export interface ReviewDoc extends Document {
  body: string
  rating: number
  author: UserDoc
}

// an interface that describes the properties
// that a user model has
interface ReviewModel extends Model<ReviewDoc> {
  build(attrs: ReviewAttrs): ReviewDoc
}

const ReviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

// adding a custom method into the review model
ReviewSchema.statics.build = (attrs: ReviewAttrs) => {
  return new Review(attrs)
}

const Review = model<ReviewDoc, ReviewModel>('Review', ReviewSchema)

export { Review }
