import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedListener} from "../ticket-created-listener";
import {Ticket} from "../../../models/ticket";
import {TicketCreatedEvent} from "@smash1986/common";

const setup = () => {
    const listener = new TicketCreatedListener(natsWrapper.client);
    const eventData: TicketCreatedEvent['data'] = {
        id: global.generateId(),
        title: 'concert',
        price: 20,
        userId: global.generateId(),
        version: 0,

    }
    const msg = {
        ack: jest.fn()
    }
    return {listener, eventData, msg}
}

it('creates and saves a ticket', async () => {

    const {listener, eventData, msg} = setup();

    await listener.OnMessage(eventData, msg as any);

    const ticket = await Ticket.findById(eventData.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(eventData.title);
    expect(ticket!.price).toEqual(eventData.price);
    expect(ticket!.version).toEqual(0);
})

it('acks the message', async () => {
    const {listener, eventData, msg} = setup();

    await listener.OnMessage(eventData, msg as any);

    const ticket = await Ticket.findById(eventData.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(eventData.title);
    expect(ticket!.price).toEqual(eventData.price);
    expect(ticket!.version).toEqual(0);
    expect(msg.ack).toHaveBeenCalled();
})