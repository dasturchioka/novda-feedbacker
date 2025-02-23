import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

const app: Express = express()
const port = process.env.PORT || 7667

app.use(express.json())
app.use(cors({ origin: '*' }))

app.get('/', (req: Request, res: Response) => {
	res.send('Express + TypeScript Server')
})

app.listen(port, () => {
	console.log(`[server]: Server is running at ${port}`)
})
