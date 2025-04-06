import { Router } from 'express';
import { createUser } from '../controllers/userControllers';

const router = Router();

router.post('/auth/user/signup', createUser);

export default router;