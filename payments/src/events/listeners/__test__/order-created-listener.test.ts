import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedListener} from "../order-created-listener";
import {OrderCreatedEvent, OrderStatus} from "@smash1986/common";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    const event: OrderCreatedEvent['data'] = {
        id: global.generateId(),
        status: OrderStatus.Created,
        userId: global.generateId(),
        expiresAt: new Date(),
        ticket: {id: global.generateId(), price: 20},
        version: 0
    }
    const msg = {
        ack: jest.fn()
    }

    return {listener, event, msg};
}

it('saves the order', async () => {
    const {listener, event, msg} = await setup();

    await listener.OnMessage(event, msg as any);

    const order = await Order.findById(event.id);

    expect(order).toBeDefined();
    expect(order!.price).toEqual(event.ticket.price);
    expect(msg.ack).toHaveBeenCalled();
});