import { connect, connection } from 'mongoose'
import { places, descriptors } from './seed-helpers'
import { Campground } from '../models/campground'
import { User } from '../models/user'
import { cities } from './cities'
import { Review } from '../models/review'

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI must be defined')
}

connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

connection.on('error', console.error.bind(console, 'Connection error:'))
connection.once('open', () => {
  console.log('Connected to MongoDB')
})

const sample = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
  // reset database
  await User.deleteMany({})
  await Campground.deleteMany({})

  // register a new user
  const password = 'test123'
  const user = User.build({
    username: 'test',
    email: 'test@test.com'
  })
  const testUser = await User.register(user, password)

  // pre-populate the campground collection
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10

    const campground = Campground.build({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: 'Point',
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: 'https://unsplash.com/photos/2DH-qMX6M4E/download?force=true&w=640',
          filename: 'default-image'
        }
      ],
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      author: testUser,
      reviews: [],
      price
    })

    const review = Review.build({
      body: 'This is a pre-populated review',
      rating: 5,
      author: testUser
    })
    campground.reviews.push(review)

    await review.save()
    await campground.save()
  }
  console.log('MongoDB is seeded')
}

seedDB().then(() => {
  connection.close()
})
