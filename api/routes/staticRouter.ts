import { Router } from 'express';
const staticRouter = Router();
const path = require('path');

staticRouter.get(`index.html`, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

export default staticRouter;