import {OrderCreatedEvent, OrderStatus, TicketUpdatedEvent} from "@smash1986/common";
import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import * as nats from 'nats';

const setup = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: global.generateId(),
    });
    await ticket.save()

    const listener = new OrderCreatedListener(natsWrapper.client);
    const eventData: OrderCreatedEvent['data'] = {
        id: global.generateId(),
        userId: global.generateId(),
        status: OrderStatus.Created,
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        expiresAt: new Date()
    }
    const msg = {
        ack: jest.fn()
    }
    return {listener, eventData, msg}
}

it('sets the userId of the ticket', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    const ticket = await Ticket.findById(eventData.ticket.id);
    expect(ticket!.orderId).toEqual(eventData.id);
})

it('acks the message', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    const mockPublish = natsWrapper.client.jetstream().publish as jest.Mock;
    expect(mockPublish).toHaveBeenCalled();
    const jc = nats.JSONCodec()
    const ticketUpdatedData = jc.decode(mockPublish.mock.calls[0][1]) as TicketUpdatedEvent['data'];
    expect(ticketUpdatedData.orderId).toEqual(eventData.id);
})