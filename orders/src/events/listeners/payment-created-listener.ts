import {Listener, Subjects, PaymentCreatedEvent, NotFoundError, OrderStatus} from "@smash1986/common";
import {JsMsg} from "nats";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/orders";
import {OrderUpdatedPublisher} from "../publishers/order-updated-publisher";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    async OnMessage(data: { id: string; orderId: string; stripeId: string; }, msg: JsMsg): Promise<void> {
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        order.status = OrderStatus.Complete;
        await order.save();

        await new OrderUpdatedPublisher(this.nc).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt,
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            },
            version: order.version,
        });
        msg.ack();
    }

    consumerName: string = 'orders-service';
    readonly subject = Subjects.PaymentCreated;

}