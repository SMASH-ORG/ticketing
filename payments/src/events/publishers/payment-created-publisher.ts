import {PaymentCreatedEvent, Publisher, Subjects, TicketCreatedEvent} from "@smash1986/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}