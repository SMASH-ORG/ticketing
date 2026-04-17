import express from 'express';
import {body} from "express-validator";
import {Request, Response} from "express";
import {validateRequest, BadRequestError} from "@smash1986/common";
import {User} from "../models/user";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();
router.post('/api/users/signin', [
        body('email')
            .isEmail()
            .withMessage("email must be valid"),
        body('password')
            .trim()
            .notEmpty()
            .withMessage("You must supply a password")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {email, password} = req.body;
        const existingUser = await User.findOne({email});
        if (existingUser) {
            const passwordsMatch = await Password.compare(existingUser.password, password);
            if (passwordsMatch) {
                const token = jwt.sign({
                    id: existingUser.id,
                    email: existingUser.email
                }, process.env.JWT_KEY!, {
                    expiresIn: '1d'
                })
                req.session = {
                    jwt: token
                }
                res.status(200).send(existingUser);
                return;
            }
        }
        throw new BadRequestError('Invalid credentials');
    }
);

export {router as signinRouter};


