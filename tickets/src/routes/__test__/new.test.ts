import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import { natsWrapper } from '../../nats-wrapper';


it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({}).expect(401);
});

it('return a status other than 401 if the user is signed in', async () => {
    const cookies = await global.signup()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if invalid title is provided', async () => {
    const cookies = await global.signup()
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({title: '', price: 10}).expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({price: 10}).expect(400);
});


it('returns an error if invalid price is provided', async () => {
    const cookies = await global.signup()
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({title: '12312', price: -10}).expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({title: 'sadas'}).expect(400);
});

it('creates a ticket with valid input', async () => {
    let ticket = await Ticket.findOne({title: 'sadasfaf'})
    expect(ticket).toBeNull()

    const cookies = await global.signup()
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({title: 'sadasfaf', price: 10}).expect(201);

    ticket = await Ticket.findOne({title: 'sadasfaf'})
    expect(ticket).not.toBeNull()
    expect(ticket!.price).toEqual(10)
});

it('publishes an event', async () => {
    const cookies = await global.signup()
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({title: 'sadasfaf', price: 10}).expect(201);

    expect(natsWrapper.client.jetstream().publish).toHaveBeenCalled();
})