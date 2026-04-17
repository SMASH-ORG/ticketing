import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@smash1986/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order} from "../models/orders";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";


const TICKET_EXPIRATION_WINDOW_SECONDS = parseInt(process.env.TICKET_EXPIRATION_WINDOW_SECONDS || '300');

const router = express.Router();
router.post('/api/orders', requireAuth, [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided')
    ], validateRequest,
    async (req: Request, res: Response) => {
        const {ticketId} = req.body;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError("Ticket not found");
        }

        if (await ticket.isReserved()) {
            throw new BadRequestError("Ticket already reserved");
        }

        console.log({TICKET_EXPIRATION_WINDOW_SECONDS: TICKET_EXPIRATION_WINDOW_SECONDS})
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + TICKET_EXPIRATION_WINDOW_SECONDS);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt,
            ticket: {
                id: ticket.id,
                price: ticket.price
            },
            version: order.version,
        });
        res.status(201).send(order);
    }
);

export {router as newOrderRouter};