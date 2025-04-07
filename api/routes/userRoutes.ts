import { Router } from 'express';
import { createUser, signinUser } from '../controllers/userControllers';

const router = Router();

router.post('/auth/user/signup', createUser);
router.post('/auth/user/signin', signinUser);

export default router;