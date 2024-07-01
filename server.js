import 'colors'
import 'dotenv/config'
import morgan from 'morgan'
import express from 'express'
import path from 'path'

import authRoutes from './app/auth/auth.routes.js'
import userRoutes from './app/user/user.routes.js'
import exerciseRoutes from './app/exercise/exercise.routes.js'
import workoutRoutes from './app/workout/workout.routes.js'

import { prisma } from './app/prisma.js'
import { errorHandler, notFound } from './app/middleware/error.middleware.js'

const app = express()

async function main() {
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev')) // MORGAN - логирование внутри консоли
  
  app.use(express.json()) //файлы грузятся и отдаются в формате JSON

  const __dirname = path.resolve() //получение корневого каталога

  app.use('/uploads', express.static(path.join(__dirname, '/uploads/'))) //Файл для статичекий файлов (изображения и тд)

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/exercises', exerciseRoutes)
  app.use('/api/workouts', workoutRoutes)

  app.use(notFound)
  app.use(errorHandler)

  const PORT = process.env.PORT || 5000

  app.listen(
    PORT,
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      .blue
      .bold
    )
  )
}

main().then(async () => {
  await prisma.$disconnect()
})
.catch( async e => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})