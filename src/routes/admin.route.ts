import { Router } from 'express'
import { login, registerAdmin } from '../controllers/admin.controller'

const router = Router()

// simple login
router.post('/login', login)

// register admin by system
router.post('/register', registerAdmin)

export default router