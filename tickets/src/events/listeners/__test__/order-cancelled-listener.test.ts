import {OrderCancelledEvent, OrderCreatedEvent, OrderStatus, TicketUpdatedEvent} from "@smash1986/common";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import * as nats from 'nats';

const setup = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: global.generateId(),
    });
    ticket.orderId = global.generateId();
    await ticket.save()

    const listener = new OrderCancelledListener(natsWrapper.client);
    const eventData: OrderCancelledEvent['data'] = {
        id: ticket.orderId!,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    }
    const msg = {
        ack: jest.fn()
    }
    return {listener, eventData, msg}
}

it('updates the ticket, publishes an event ,and acks the message', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    const ticket = await Ticket.findById(eventData.ticket.id);
    expect(ticket!.orderId).toBeUndefined();
    const mockPublish = natsWrapper.client.jetstream().publish as jest.Mock;
    expect(mockPublish).toHaveBeenCalled();
    const jc = nats.JSONCodec()
    const ticketUpdatedData = jc.decode(mockPublish.mock.calls[0][1]) as TicketUpdatedEvent['data'];
    expect(ticketUpdatedData.orderId).toBeUndefined();
    expect(ticketUpdatedData.id).toEqual(ticket!.id);
    expect(ticketUpdatedData.version).toEqual(1);
    expect(msg.ack).toHaveBeenCalled();
})