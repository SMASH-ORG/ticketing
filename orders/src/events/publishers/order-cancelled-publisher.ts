import {OrderCancelledEvent, Publisher, Subjects} from "@smash1986/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}