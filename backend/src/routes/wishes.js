import express from 'express';
import { getWishes, createWish, likeWish } from '../controllers/wishes.js';

const router = express.Router();

router.get('/', getWishes);
router.post('/', createWish);
router.post('/:id/like', likeWish);

export default router;
