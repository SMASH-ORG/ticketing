import {Publisher, Subjects, TicketCreatedEvent} from "@smash1986/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}