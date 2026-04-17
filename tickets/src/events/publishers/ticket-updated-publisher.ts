import {Publisher, Subjects, TicketUpdatedEvent} from "@smash1986/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}