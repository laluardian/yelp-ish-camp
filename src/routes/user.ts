import { Router } from 'express'
import { catchAsync } from '../utils/catch-async'
import { authenticate } from 'passport'
import {
  renderLoginForm,
  renderRegisterForm,
  userLogin,
  userLogout,
  userRegister
} from '../controllers/user'

const router = Router()

router.route('/register').get(renderRegisterForm).post(catchAsync(userRegister))

router
  .route('/login')
  .get(renderLoginForm)
  .post(
    authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    catchAsync(userLogin)
  )

router.get('/logout', userLogout)

export { router as userRouter }
