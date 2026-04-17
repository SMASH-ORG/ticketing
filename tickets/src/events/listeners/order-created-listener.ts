import {Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects} from "@smash1986/common";
import {JsMsg} from "nats";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";
import {natsWrapper} from "../../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    consumerName: string = 'tickets-service';

    async OnMessage(data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: Date;
        ticket: { id: string; price: number; };
        version: number;
    }, msg: JsMsg): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new NotFoundError('Ticket not found');
        }
        if (ticket.orderId) {
            throw new Error('Ticket already reserved');
        }
        ticket.set({orderId: data.id});
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

}