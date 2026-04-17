import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {OrderStatus} from "@smash1986/common";
import {natsWrapper} from "../../nats-wrapper";

it('marks an order as cancelled', async () => {
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
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204);

    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200);
    expect(fetchedOrder.status).toEqual(OrderStatus.Cancelled);

})

it('emits an order cancelled event', async () => {
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
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204);

    expect(natsWrapper.client.jetstream().publish).toHaveBeenCalled();
});