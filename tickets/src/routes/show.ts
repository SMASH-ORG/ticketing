import express, {Request, Response} from 'express';
import {Ticket} from "../models/ticket";
import {NotFoundError} from "@smash1986/common";

const router = express.Router();
router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
        res.send(ticket);
    } else {
        throw new NotFoundError();
    }
});

export {router as showTicketRouter};