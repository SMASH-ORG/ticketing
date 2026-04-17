import {Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects} from "@smash1986/common";
import {JsMsg} from "nats";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";
import {natsWrapper} from "../../nats-wrapper";
import {Order} from "../../models/orders";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    consumerName: string = "orders-service";

    async OnMessage(data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: Date;
        ticket: { id: string; price: number; };
        version: number;
    }, msg: JsMsg): Promise<void> {
        const now = new Date().getTime();
        if (!data.expiresAt) {
            throw new Error('OrderCreatedListener: expiresAt is undefined');
        }
        if (typeof data.expiresAt === 'string') {
            data.expiresAt = new Date(data.expiresAt);
        }
        // if is it already expired
        if (data.expiresAt.getTime() < now) {
            const order = await Order.findById(data.id).populate('ticket');
            if (!order) {
                throw new NotFoundError('Order not found');
            }
            if (order.status != OrderStatus.Created) {
                msg.ack();
                // throw new Error('Order status is not Created');
                return;
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
            msg.ack();
        } else {
            msg.nak(data.expiresAt.getTime() - now)
        }
    }
}