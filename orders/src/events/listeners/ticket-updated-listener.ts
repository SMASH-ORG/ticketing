import {Listener, NotFoundError, Subjects, TicketCreatedEvent, TicketUpdatedEvent} from "@smash1986/common";
import {JsMsg} from "nats";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    async OnMessage(data: {
        id: string;
        title: string;
        price: number;
        userId: string;
        version: number;
    }, msg: JsMsg): Promise<void> {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new NotFoundError(`Ticket with id ${data.id} and version ${data.version - 1} not found`);
        }
        ticket.set({title: data.title, price: data.price});
        await ticket.save()
        msg.ack();
    }


    consumerName: string = 'orders-service';

    readonly subject = Subjects.TicketUpdated;

}