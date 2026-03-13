import { Router } from 'express'
import {checkBloodTestNormal} from '../controllers/bloodTests'

const router = Router()


router.post('/checkBloodTest', checkBloodTestNormal)


export default router
