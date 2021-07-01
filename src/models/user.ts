import {
  model,
  Schema,
  PassportLocalModel,
  PassportLocalSchema,
  PassportLocalDocument
} from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

// an interface that describes the properties
// that are required to create a new user
interface UserAttrs {
  username: string
  email: string
}

// an interface that describes the properties
// that a user document has
export interface UserDoc extends PassportLocalDocument {
  username: string
  email: string
}

// an interface that describes the properties
// that a user model has
interface UserModel extends PassportLocalModel<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}) as PassportLocalSchema

UserSchema.plugin(passportLocalMongoose)

UserSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = model<UserDoc, UserModel>('User', UserSchema)

export { User }

/**
 * a brief note:
 * having passport-local-mongoose to work with TS is kinda annoying tbh
 * it tooks me a long time to figure it out
 * here is the link where I got some solutions:
 * https://github.com/saintedlama/passport-local-mongoose/issues/304
 */
