import { NextFunction, Request, Response } from 'express'
import { User } from '../models/user'

export const renderRegisterForm = (req: Request, res: Response) => {
  res.render('users/register')
}

export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body
    const user = User.build({ username, email })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
      if (err) return next(err)
      req.flash('success', 'Welcome to Yelp-ish Camp')
      res.redirect('/campgrounds')
    })
  } catch (err) {
    req.flash('error', err.message)
    res.redirect('/register')
  }
}

export const renderLoginForm = (req: Request, res: Response) => {
  res.render('users/login')
}

export const userLogin = async (req: Request, res: Response) => {
  req.flash('success', 'Welcome back to Yelp-ish Camp')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
}

export const userLogout = (req: Request, res: Response) => {
  req.logout()
  req.flash('success', 'Goodbye!')
  res.redirect('/campgrounds')
}
