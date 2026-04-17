import {Listener, NotFoundError, OrderCreatedEvent, OrderStatus, OrderUpdatedEvent, Subjects} from "@smash1986/common";
import {JsMsg} from "nats";
import {Order} from "../../models/order";

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
    readonly subject = Subjects.OrderUpdated;
    consumerName: string = 'payments-service';

    async OnMessage(data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: Date;
        ticket: { id: string; price: number; };
        version: number;
    }, msg: JsMsg): Promise<void> {
        const order = await Order.findById(data.id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        order.set({
            status: data.status
        });
        await order.save();
        msg.ack();
    }

}