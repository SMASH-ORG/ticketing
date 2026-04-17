import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";

it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    })
    await ticket.save();
    const user = await global.signup();
    // Make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);
    // Make request to fetch the order
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200);
    expect(fetchedOrder.id).toEqual(order.id);
})

it('returns an error if tries to fetch another users order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    })
    await ticket.save();
    const user1 = await global.signup("a@a.com", "user1");
    const user2 = await global.signup("b@b.com", "user2");

    // Make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ticketId: ticket.id})
        .expect(201);
    // Make request to fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user2)
        .expect(403);
})
