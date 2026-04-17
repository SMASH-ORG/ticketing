import {OrderCreatedEvent, OrderUpdatedEvent, Publisher, Subjects} from "@smash1986/common";

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
    readonly subject = Subjects.OrderUpdated;
}