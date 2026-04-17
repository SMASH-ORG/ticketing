import {Ticket} from "../../../models/ticket";
import {Order} from "../../../models/orders";
import {OrderCancelledEvent, OrderCreatedEvent, OrderStatus, Subjects} from "@smash1986/common";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedListener} from "../order-created-listener";
import * as nats from "nats";

const setup = async (ticketExpirationWindowSeconds: number = 300) => {
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + ticketExpirationWindowSeconds);
    const order = Order.build({
        ticket,
        userId: global.generateId(),
        status: OrderStatus.Created,
        expiresAt: expiration,
    });
    await order.save();

    const listener = new OrderCreatedListener(natsWrapper.client);
    const eventData: OrderCreatedEvent['data'] = {
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt,
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        version: order.version,
    };
    const msg = {
        ack: jest.fn(),
        nak: jest.fn(),
    };
    return {listener, eventData, msg};
}
it('nacks if the order has not expired yet', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    expect(msg.nak).toHaveBeenCalled();
    expect(msg.nak.mock.calls[0][0]).toBeGreaterThan(0);
})

it('acks if the order has already expired', async () => {
    const {listener, eventData, msg} = await setup(-1);
    await listener.OnMessage(eventData, msg as any);
    expect(msg.ack).toHaveBeenCalled();
})

it('publishes an OrderCancelled event if the order has already expired', async () => {
    const {listener, eventData, msg} = await setup(-1);
    await listener.OnMessage(eventData, msg as any);

    expect(natsWrapper.client.jetstream().publish).toHaveBeenCalled();
    const mock = natsWrapper.client.jetstream().publish as jest.Mock;
    const jc = nats.JSONCodec();
    const data = jc.decode(mock.mock.calls[0][1]) as OrderCancelledEvent['data'];

    expect(mock.mock.calls[0][0]).toEqual(Subjects.OrderCancelled);
    expect(data.id).toEqual(eventData.id);
})
