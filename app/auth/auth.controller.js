import asyncHandler from 'express-async-handler'

import { prisma } from '../prisma.js'
import { generateToken } from './generate-token.js'
import 'argon2'
import { hash, verify } from 'argon2'
import { UserFields } from '../utils/user.utils.js'

// @desc    Auth user
// @route   POST /api/users/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  const isValidPassword = await verify(user.password, password)

  if (user && isValidPassword) {
    const token = generateToken(user.id)
    res.json({ user, token })
  } else {
    res.status(401)
    throw new Error('Email and password are not correct')
  }
})

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => { //asyncHandler - для отлова ошибок обработчиком express
  const {email, password} = req.body

  const isHaveUser = await prisma.user.findUnique({
    where: {
      email: email //если названия одинаковые, можно не дублировать и оставить только //email
    }
  })

  if (isHaveUser) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hash(password)
    },
    select: UserFields
  })

  const token = generateToken(user.id)

  res.json({ user, token })
})