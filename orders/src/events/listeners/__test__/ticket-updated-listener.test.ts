import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedListener} from "../ticket-created-listener";
import {Ticket} from "../../../models/ticket";
import {TicketCreatedEvent, TicketUpdatedEvent} from "@smash1986/common";
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {Error} from "mongoose";

const setup = async () => {
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    const listener = new TicketUpdatedListener(natsWrapper.client);
    const eventData: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'concert updated',
        price: 30,
        userId: global.generateId(),
        version: ticket.version + 1,
    }

    const msg = {
        ack: jest.fn()
    }
    return {listener, eventData, msg}
}

it('throws an error if ticket not found', async () => {
    const {listener, eventData, msg} = await setup();
    eventData.version = 2;
    await expect(async () => {
        await listener.OnMessage(eventData, msg as any);
    }).rejects.toThrow(`Ticket with id ${eventData.id} and version ${eventData.version - 1} not found`);

    expect(msg.ack).not.toHaveBeenCalled();
})

it('updates and saves a ticket', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    const ticket = await Ticket.findById(eventData.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(eventData.title);
    expect(ticket!.price).toEqual(eventData.price);
    expect(ticket!.version).toEqual(eventData.version);
})

it('acks the message', async () => {
    const {listener, eventData, msg} = await setup();
    await listener.OnMessage(eventData, msg as any);
    const ticket = await Ticket.findById(eventData.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(eventData.title);
    expect(ticket!.price).toEqual(eventData.price);
    expect(msg.ack).toHaveBeenCalled();
})

