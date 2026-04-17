import {NextFunction, Request, Response} from 'express';
import {NotAuthenticated} from "../errors/not-authenticated";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        throw new NotAuthenticated();
    }
    next();
}