import { Request, Response } from 'express'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import { cloudinary } from '../cloudinary'
import { Campground } from '../models/campground'

// https://stackoverflow.com/questions/54496398
const mbxToken: string = process.env.MAPBOX_TOKEN!
const geocoder = mbxGeocoding({ accessToken: mbxToken })

// a helper function to map image files
const mapImageFiles = (files: Express.Multer.File[]) => {
  return files.map((file: Express.Multer.File) => ({
    url: file.path,
    filename: file.filename
  }))
}

export const campgroundIndex = async (req: Request, res: Response) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}

export const renderNewCampgroundForm = async (req: Request, res: Response) => {
  res.render('campgrounds/new')
}

export const createCampground = async (req: Request, res: Response) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
      mode: 'mapbox.places'
    })
    .send()
  const campground = Campground.build(req.body.campground)
  campground.geometry = geoData.body.features[0].geometry
  // @ts-ignore
  // in this case, req.files' type surely is Express.Multer.File[]
  campground.images = mapImageFiles(req.files)
  /**
   * we are going to get some 'annoying' errors if we use
   * req.user._id to get the user id even though it actually works
   */
  campground.author = res.locals.currentUser._id
  await campground.save()
  req.flash('success', 'Successfully made a new campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

export const showCampground = async (req: Request, res: Response) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    })
    .populate('author')
  if (!campground) {
    req.flash('error', 'Oops, cannot find the campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', { campground })
}

export const renderEditCampgroundForm = async (req: Request, res: Response) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground) {
    req.flash('error', 'Oops, cannot find the campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground })
}

export const updateCampground = async (req: Request, res: Response) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground
  })
  if (!campground) {
    req.flash('error', 'The campground is missing')
    return res.redirect('/campgrounds')
  }
  // @ts-ignore
  const imgs = mapImageFiles(req.files)
  campground.images.push(...imgs)
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: {
        images: {
          filename: {
            $in: req.body.deleteImages
          }
        }
      }
    })
  }
  await campground.save()
  req.flash('success', 'Successfully updated a campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

export const deleteCampground = async (req: Request, res: Response) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash('success', 'Successfully deleted a campground')
  res.redirect('/campgrounds')
}
