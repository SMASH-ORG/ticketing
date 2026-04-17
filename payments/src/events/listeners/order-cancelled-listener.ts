import {
    Listener,
    NotFoundError,
    OrderCancelledEvent,
    OrderStatus,
    Subjects
} from "@smash1986/common";
import {JsMsg} from "nats";
import {Order} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    async OnMessage(data: { id: string; ticket: { id: string; }; version: number; }, msg: JsMsg): Promise<void> {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });
        if (!order) {
            throw new NotFoundError(`Order with an id of ${data.id} and version of ${data.version} not found`);
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        msg.ack();
    }

    readonly subject = Subjects.OrderCancelled;
    consumerName: string = 'payments-service';
}