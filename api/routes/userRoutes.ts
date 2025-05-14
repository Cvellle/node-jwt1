import { Router } from 'express';
import { createUser, handleRefreshToken, signinUser } from '../controllers/userControllers';
import { authMiddleware } from '../middleware/authMiddleware';
import { getCurrentUser } from '../controllers/userControllers';
import bodyParser from 'body-parser';

const router = Router();
var jsonParser = bodyParser.json()
    // create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/auth/user/signup', createUser);
router.post('/auth/signin', signinUser);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/refreshToken', handleRefreshToken);
router.get('/logout', handleLogout);

export default router;