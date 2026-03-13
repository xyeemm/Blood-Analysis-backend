import express, { Request, Response } from 'express'
import router from './routes/bloodTestRoutes'

const app = express()
const PORT = 5000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
	res.send('Server is running with Node + TypeScript 🚀')
})
app.use('/api', router)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
