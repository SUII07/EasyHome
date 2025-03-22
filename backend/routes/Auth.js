import express from 'express'
import { Login, Logout, register, getUser, updateUser, deleteUser } from '../controllers/Auth.js'
import { verifyToken } from '../middleware/auth.js'

const AuthRoutes = express.Router()

// Public routes
AuthRoutes.post('/register', register)
AuthRoutes.post('/login', Login)
AuthRoutes.post('/logout', Logout)

// Protected routes - require authentication
AuthRoutes.get('/user/:id', verifyToken, getUser)
AuthRoutes.put('/update/:id', verifyToken, updateUser)
AuthRoutes.delete('/delete/:id', verifyToken, deleteUser)

export default AuthRoutes
