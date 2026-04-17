import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";


it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', await global.signup())
        .send({title: 'asldkfj', price: 20})
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title: 'asldkfj', price: 20})
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const userId1 = new mongoose.Types.ObjectId().toHexString();
    const userId2 = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', await global.signup(undefined, userId1))
        .send({title: 'asldkfj', price: 20})
        .expect(201);
    const ticketId = response.body.id
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', await global.signup(undefined, userId2))
        .send({title: 'asldkfj', price: 20})
        .expect(403);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', await global.signup())
        .send({title: 'asldkfj', price: 20})
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', await global.signup()).send({
            title: '',
            price: 20
        }).expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', await global.signup()).send({
            title: 'sadasfd',
        }).expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', await global.signup())
        .send({title: 'asldkfj', price: 20})
        .expect(201);

    const updateResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', await global.signup()).send({
            title: 'new title',
            price: 30
        }).expect(200);

    expect(updateResponse.body.title).toEqual('new title');
    expect(updateResponse.body.price).toEqual(30);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);
    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(30);
});

it('publishes an event', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', await global.signup())
        .send({title: 'asldkfj', price: 20})
        .expect(201);

    const updateResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', await global.signup()).send({
            title: 'new title',
            price: 30
        }).expect(200);

    expect(updateResponse.body.title).toEqual('new title');
    expect(updateResponse.body.price).toEqual(30);
    expect(natsWrapper.client.jetstream().publish).toHaveBeenCalled();

});

it('rejects updates if the ticket is reserved', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: global.generateId(),
    });
    ticket.orderId = global.generateId();
    await ticket.save()

    const cookie = await global.signup("a@a.com", ticket.userId);
    await request(app)
        .put(`/api/tickets/${ticket.id}`)
        .set('Cookie', cookie).send({
            title: 'new title',
            price: 30
        }).expect(400);
});