import Joi, { AnySchema, CustomHelpers, ExtensionFactory, Root, StringSchema } from 'joi'
import sanitizeHtml from 'sanitize-html'

// https://stackoverflow.com/questions/47618273/
interface ExtendedStringSchema extends StringSchema {
  escapeHTML(): this
}

interface NewRoot extends Root {
  string(): ExtendedStringSchema
}

const extension: ExtensionFactory = (joi: Root) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value: string, helpers: CustomHelpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        })
        if (clean !== value) {
          return helpers.error('string.escapeHTML', { value })
        }
        return clean
      }
    }
  }
})

const extendedJoi: NewRoot = Joi.extend(extension)

export const campgroundSchema: AnySchema = extendedJoi.object({
  campground: extendedJoi
    .object({
      title: extendedJoi.string().required().escapeHTML(),
      price: extendedJoi.number().required().min(0),
      location: extendedJoi.string().required().escapeHTML(),
      description: extendedJoi.string().required().escapeHTML()
    })
    .required(),
  deleteImages: extendedJoi.array()
})

export const reviewSchema: AnySchema = extendedJoi.object({
  review: extendedJoi
    .object({
      rating: extendedJoi.number().required().min(1).max(5),
      body: extendedJoi.string().required().escapeHTML()
    })
    .required()
})

/**
 * note that these schemas are not mongoose schema,
 * they are here in order to validate our data before
 * we attempt to save it in mongoose
 */
