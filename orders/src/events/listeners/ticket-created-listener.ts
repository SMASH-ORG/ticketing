import {Listener, Subjects, TicketCreatedEvent} from "@smash1986/common";
import {JsMsg} from "nats";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    consumerName: string = 'orders-service';

    async OnMessage(data: { id: string; title: string; price: number; userId: string; }, msg: JsMsg): Promise<void> {
        const ticket = Ticket.build({
            id: data.id,
            title: data.title,
            price: data.price
        });
        await ticket.save()
        msg.ack();
    }

    readonly subject = Subjects.TicketCreated;

}