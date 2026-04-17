import * as nats from "nats";

import {Subjects, TicketCreatedEvent, Listener, TicketUpdatedEvent} from "@smash1986/common"


export class TicketCreatedListener
    extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    consumerName = 'ticket-created-listener';

    async OnMessage(data: TicketCreatedEvent['data'], msg: nats.JsMsg): Promise<void> {
        console.log("Event data!", data);
        await msg.ackAck();
    }
}

export class TicketUpdatedListener
    extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    consumerName = 'ticket-updated-listener';

    async OnMessage(data: TicketUpdatedEvent['data'], msg: nats.JsMsg): Promise<void> {
        console.log("Event data!", data);
        await msg.ackAck();
    }
}