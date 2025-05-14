import { Router } from 'express';
import { createUser, handleRefreshToken, signinUser } from '../controllers/userControllers';
import { verifyJWT } from '../middleware/verifyJWT';
import { getCurrentUser } from '../controllers/userControllers';
import { handleLogout } from '../controllers/userControllers';

const router = Router();

router.post('/auth/user/signup', createUser);
router.post('/auth/signin', signinUser);
router.get('/me', verifyJWT, getCurrentUser);
router.get('/refreshToken', handleRefreshToken);
router.get('/logout', handleLogout);

export default router;