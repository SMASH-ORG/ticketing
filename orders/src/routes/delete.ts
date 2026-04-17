import express, {Request, Response} from 'express';
import {NotFoundError, OrderStatus, requireAuth, NotAuthorized, BadRequestError} from "@smash1986/common";
import {Order} from "../models/orders";
import {natsWrapper} from "../nats-wrapper";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";

const router = express.Router();
router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError('Order not found');
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorized();
    }
    if (order.status === OrderStatus.Complete) {
        throw new BadRequestError('Order already completed');
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        ticket: {
            id: order.ticket.id
        },
        version: order.version,
    });

    res.status(204).send({});
});

export {router as deleteOrderRouter};