import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";

it('return an error if the ticket does not exist', async () => {
    const ticketId = global.generateId()
    await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signup())
        .send({ticketId})
        .expect(404);
})

it('return an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    })
    await ticket.save();
    const order = global.createOrder(ticket);
    await order.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signup())
        .send({ticketId: ticket.id})
        .expect(400);
})

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signup())
        .send({ticketId: ticket.id})
        .expect(201);
})

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signup())
        .send({ticketId: ticket.id})
        .expect(201);

    expect(natsWrapper.client.jetstream().publish).toHaveBeenCalled();
});