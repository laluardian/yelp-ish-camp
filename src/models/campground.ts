import { Model, model, Document, Schema } from 'mongoose'
import { Review, ReviewDoc } from './review'
import { UserDoc } from './user'
import { cloudinary } from '../cloudinary'

type ImageDoc = {
  url: string
  filename: string
}

type Geometry = {
  type: 'Point'
  coordinates: number[]
}

// an interface that describes the properties
// that are required to create a new campground
interface CampgroundAttrs {
  title: string
  images: ImageDoc[]
  price: number
  description: string
  location: string
  author: UserDoc
  reviews: ReviewDoc[]
  geometry: Geometry
}

// an interface that describes the properties
// that a campground document has
export interface CampgroundDoc extends Document {
  title: string
  images: ImageDoc[]
  price: number
  description: string
  location: string
  author: UserDoc
  reviews: ReviewDoc[]
  geometry: Geometry
}

// an interface that describes the properties
// that a user model has
interface CampgroundModel extends Model<CampgroundDoc> {
  build(attrs: CampgroundAttrs): CampgroundDoc
}

// think of this as some kind of a helper schema in order
// to inject a virtual property into the campground schema
const ImageSchema = new Schema({
  url: String,
  filename: String
})

const CampgroundSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    images: [ImageSchema],
    price: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    description: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  { toJSON: { virtuals: true } }
)

// regarding 'this' -> https://stackoverflow.com/questions/41944650
ImageSchema.virtual('thumbnail').get(function (this: ImageDoc) {
  if (this.url.includes('w=640')) {
    // for the image url that we use for seeding
    // https://unsplash.com/photos/2DH-qMX6M4E/download?force=true&w=640
    return this.url.replace('w=640', 'w=200')
  }
  // the cloudinary image urls look more or less like this:
  // https://res.cloudinary.com/demo/image/upload/v1624021843/folder/ct6rmusumt2wjt9vztny.png
  return this.url.replace('/upload', '/upload/w_200')
})

CampgroundSchema.virtual('properties.popUpMarkup').get(function (this: CampgroundDoc) {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>
  `
})

// deleting all reviews and images that's associated with a particular campground
CampgroundSchema.post('findOneAndDelete', async function (doc: CampgroundDoc) {
  // console.log(doc)
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
    for (let i = 0; i < doc.images.length; i++) {
      await cloudinary.uploader.destroy(doc.images[i].filename)
    }
  }
})

// adding a custom method into the campground model
CampgroundSchema.statics.build = (attrs: CampgroundAttrs) => {
  return new Campground(attrs)
}

const Campground = model<CampgroundDoc, CampgroundModel>('Campground', CampgroundSchema)

export { Campground }

/**
 * a brief note:
 * we can easily make a new user document by instantiating
 * the user constructor with the keyword 'new', however if
 * we're following this pattern we can't really do an effective
 * type checking with TypeScript, so the reason why I added
 * a custom 'build' method into the campground model is simply
 * to help for the type checking
 * (we can actually create the function for creating a new
 * campground outside of the model, but in my opinion this
 * approach where we put the function/method inside the model
 * is a better and less annoying approach, it will also make
 * our code cleaner and easier to understand)
 */
