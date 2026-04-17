import {OrderCreatedEvent, Publisher, Subjects} from "@smash1986/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}