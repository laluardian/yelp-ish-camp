if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

import { connect } from 'mongoose'
import { app } from './app'

const initServer = async (port: number) => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }

  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log('Connected to MongoDB')
  } catch (err) {
    console.log(err)
  }

  app.listen(port, () => {
    console.log('Listening on port %s', port)
  })
}

initServer(3000)
