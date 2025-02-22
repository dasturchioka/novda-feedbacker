import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import { z } from 'zod'

const prisma = new PrismaClient()

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { username, password }: { username: string; password: string } = req.body

		const loginSchema = z.object({
			username: z
				.string()
				.min(3, "Username kamida 3 ta harfdan iborat bo'lishi kerak")
				.max(18, 'Username 18 ta belgidan oshmasligi kerak')
				.regex(/^[a-zA-Z0-9]+$/, 'Username faqat lotin harflari va raqamlarni qabul qilsin'),
			password: z
				.string()
				.min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
				.max(20, 'Parol 20 ta belgidan oshmasligi kerak')
				.regex(/^[a-zA-Z0-9]+$/, 'Parol faqat lotin harflari va raqamlarni qabul qilsin'),
		})

		const validation = loginSchema.safeParse({ username, password })
		if (!validation.success) {
			res.status(400).json({
				status: 400,
				errors: validation.error.format(),
			})

			return
		}

		const foundAdmin = await prisma.admin.findFirst({ where: { username } })
		if (!foundAdmin) {
			res.status(404).json({ status: 404, msg: "Bu username bo'yicha admin mavjud emas" })
			return
		}

		const passwordMatch = await bcrypt.compare(password, foundAdmin.password)
		if (!passwordMatch) {
			res.status(401).json({ status: 401, msg: "Parol noto'g'ri" })
			return
		}

		const newToken = jwt.sign(foundAdmin, String(config.ADMIN_SECRET))

		res
			.status(200)
			.json({
				status: 200,
				msg: 'Tizimga muvaffaqiyatli kirdingiz',
				token: newToken,
				admin: foundAdmin,
			})

		return
	} catch (error) {
		console.error(error)

		res.status(500).json({ status: 500, msg: 'Ichki server xatosi' })
		return
	}
}

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
	try {
		const { username, password }: { username: string; password: string } = req.body

		const loginSchema = z.object({
			username: z
				.string()
				.min(3, "Username kamida 3 ta harfdan iborat bo'lishi kerak")
				.max(18, 'Username 18 ta belgidan oshmasligi kerak')
				.regex(/^[a-zA-Z0-9]+$/, 'Username faqat lotin harflari va raqamlarni qabul qilsin'),
			password: z
				.string()
				.min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
				.max(20, 'Parol 20 ta belgidan oshmasligi kerak')
				.regex(/^[a-zA-Z0-9]+$/, 'Parol faqat lotin harflari va raqamlarni qabul qilsin'),
		})

		const validation = loginSchema.safeParse({ username, password })
		if (!validation.success) {
			res.status(400).json({
				status: 400,
				errors: validation.error.format(),
			})

			return
		}

		const foundAdmin = await prisma.admin.count({ where: { username } })

		if (foundAdmin) {
			res
				.status(403)
				.json({ status: 404, msg: "Bu username bo'yicha admin mavjud, boshqa username tanlang" })
			return
		}

		const passwordHashed = await bcrypt.hash(password, 10)

		const newAdmin = await prisma.admin.create({
			data: {
				username,
				password: passwordHashed,
			},
		})

		const newToken = jwt.sign(newAdmin, String(config.ADMIN_SECRET))

		res.status(200).json({
			status: 200,
			msg: 'Tizimga muvaffaqiyatli kirdingiz',
			token: newToken,
			admin: newAdmin,
		})

		return
	} catch (error) {
		console.error(error)

		res.status(500).json({ status: 500, msg: 'Ichki server xatosi' })
		return
	}
}
