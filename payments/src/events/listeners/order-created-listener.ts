import {Listener, OrderCreatedEvent, OrderStatus, Subjects} from "@smash1986/common";
import {JsMsg} from "nats";
import {Order} from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    consumerName: string = 'payments-service';

    async OnMessage(data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: Date;
        ticket: { id: string; price: number; };
        version: number;
    }, msg: JsMsg): Promise<void> {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });
        await order.save();
        msg.ack();
    }

}