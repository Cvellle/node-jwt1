import { Router } from 'express';
import { createUser, signinUser } from '../controllers/userControllers';
import bodyParser from 'body-parser';

const router = Router();
var jsonParser = bodyParser.json()
    // create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


router.post('/auth/user/signup', createUser);
router.post('/auth/signin', signinUser);

export default router;