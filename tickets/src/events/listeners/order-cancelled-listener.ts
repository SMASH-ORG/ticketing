import {
    Listener,
    NotFoundError,
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
    Subjects
} from "@smash1986/common";
import {JsMsg} from "nats";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";
import {natsWrapper} from "../../nats-wrapper";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    async OnMessage(data: { id: string; ticket: { id: string; }; version: number; }, msg: JsMsg): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new NotFoundError('Ticket not found');
        }

        ticket.set({orderId: undefined});
        await ticket.save();
        await new TicketUpdatedPublisher(this.nc).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });

        msg.ack();
    }

    readonly subject = Subjects.OrderCancelled;
    consumerName: string = 'tickets-service';


}