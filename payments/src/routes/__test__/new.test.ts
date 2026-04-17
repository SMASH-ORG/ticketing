import {app} from "../../app";
import request from "supertest";
import {Order} from "../../models/order";
import {OrderStatus} from "@smash1986/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

it('returns a 404 when purchasing an order that does not exist', async () => {
    const cookie = await global.signup();
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'asdasdasd',
            orderId: global.generateId()
        }).expect(404);
})

it('returns a 401 when purchasing an order and the user is not logged in', async () => {
    await request(app)
        .post('/api/payments')
        .send({
            token: 'asdasdasd',
            orderId: global.generateId()
        }).expect(401);
})

it('returns a 403 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: global.generateId(),
        userId: global.generateId(),
        price: 20,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    const cookie = await global.signup();
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'asdasdasd',
            orderId: order.id
        }).expect(403);
})

it('returns a 400 when purchasing a cancelled order', async () => {
    const order = Order.build({
        id: global.generateId(),
        userId: global.generateId(),
        price: 20,
        status: OrderStatus.Cancelled,
        version: 0,
    });
    await order.save();

    const cookie = await global.signup("a@a.com", order.userId);
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'asdasdasd',
            orderId: order.id
        }).expect(400);
})

it('returns a 201 with valid inputs', async () => {
    const order = Order.build({
        id: global.generateId(),
        userId: global.generateId(),
        price: 20,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    const cookie = await global.signup("a@a.com", order.userId);
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'tok_visa',
            orderId: order.id
        }).expect(201);
    expect(stripe.charges.create).toHaveBeenCalled();
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.currency).toEqual('usd');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.source).toEqual('tok_visa');

    const payment = Payment.findOne({
        orderId: order.id,
    });
    expect(payment).not.toBeNull();
})