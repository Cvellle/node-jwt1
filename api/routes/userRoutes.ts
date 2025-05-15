import { Router } from 'express';
import { createUser, signinUser } from '../controllers/userControllers';

// import { verifyJWT } from '../middleware/verifyJWT';
const { getCurrentUser, handleLogout, handleRefreshToken } = require('../controllers/userControllers');
const {verifyJWT} = require('../middleware/verifyJWT');
const router = Router();

router.post('/auth/user/signup', createUser);
router.post('/auth/signin', signinUser);
router.get('/me', verifyJWT, getCurrentUser);
router.get('/refreshToken', handleRefreshToken);
router.get('/logout', handleLogout);

export default router;