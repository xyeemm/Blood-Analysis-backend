import cors from 'cors'
import express, { Request, Response } from 'express'
import router from './routes/bloodTestRoutes'
import { config } from './config/env'


const app = express()
const PORT = config.PORT

// Enable CORS for browser requests
app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
	res.send('Server is running with Node + TypeScript checking 🚀')
})
app.use('/api', router)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
