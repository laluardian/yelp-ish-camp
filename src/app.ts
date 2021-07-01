import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import methodOverride from 'method-override'
import session, { SessionOptions } from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'

// @ts-ignore
// there is no types defintion avalaible for ejs-mate
// and in this case, we don't actually need one so it's fine
import ejsMate from 'ejs-mate'

// https://stackoverflow.com/questions/39615164
import * as passportLocal from 'passport-local'
const LocalStrategy = passportLocal.Strategy

import { ExpressError } from './utils/express-error'
import { campgroundRouter } from './routes/campground'
import { reviewRouter } from './routes/review'
import { User } from './models/user'
import { userRouter } from './routes/user'

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// parsing incoming requests with urlencoded payload
app.use(express.urlencoded({ extended: true }))

// override (using a query string) with
// POST having ?_method=*PUT/PATCH/DELETE*
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(helmet())

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net'
]

const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com'
]

const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com'
]

const fontSrcUrls: string[] = [
  /** your fontSrcUrls */
]

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", "'unsafe-eval'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        'https://images.unsplash.com',
        'https://unsplash.com',
        'https://upload.wikimedia.org/'
      ],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
)

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

const sessionConfig: SessionOptions = {
  name: 'sGuXgd93n',
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    // @ts-ignore
    // the expires property requires number, but even though
    // Date.now() returns number, its type is still considered Date
    expires: Date.now() + ONE_WEEK,
    maxAge: ONE_WEEK,
    httpOnly: true
    // secure: true
  }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

// @ts-ignore
// I can't really figure out the problem lol
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// setting up a temporary variable in res.locals
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

app.use('/', userRouter)
app.use('/campgrounds', campgroundRouter)
app.use('/campgrounds/:id/reviews', reviewRouter)

app.get('/', (req: Request, res: Response) => {
  res.redirect('/campgrounds')
})

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError('Page not found', 404))
})

app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
  const { status = 500 } = err
  if (!err.message) err.message = 'Oh no, something went wrong!'
  res.status(status).render('error', { err })
})

export { app }
