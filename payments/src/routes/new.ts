import express, {Request, Response} from 'express';
import {
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
    NotAuthorized,
    BadRequestError
} from "@smash1986/common";
import {body} from "express-validator";
import {Order} from "../models/order";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('token')
        .not()
        .isEmpty()
        .withMessage('Token is required'),
    body('orderId')
        .not()
        .isEmpty()
        .withMessage('OrderId is required'),
], validateRequest, async (req: Request, res: Response) => {
    const {token, orderId} = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorized();
    }
    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order');
    }
    if (order.status === OrderStatus.Complete) {
        throw new BadRequestError('Cannot pay for a completed order');
    }

    const orderPayment = await Payment.findOne({
        orderId
    });
    if (orderPayment) {
        throw new BadRequestError('Payment already exists');
    }

    const charge = await stripe.charges.create({
        amount: order.price * 100,
        currency: 'usd',
        source: token,
    });

    console.log({charge})

    const payment = Payment.build(
        {
            orderId,
            stripeId: charge.id,
            paymentDate: new Date(),
        }
    );
    await payment.save();
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
    })
    res.status(201).send({id: payment.id});
});

export {router as createChargeRouter};
