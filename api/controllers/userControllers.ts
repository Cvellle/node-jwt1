import { Request, Response } from 'express';
import User from '../models/User';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  console.log(123123)
  try {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error});
  }
};
