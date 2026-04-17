import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Order} from "../../../models/order";
import {OrderStatus} from "@smash1986/common";

const setup = async () => {
    const order = Order.build({
        id: global.generateId(),
        price: 20,
        status: OrderStatus.Created,
        userId: global.generateId(),
        version: 0
    })
    await order.save();
    const listener = new OrderCancelledListener(natsWrapper.client);
    const event = {
        id: order.id,
        ticket: {id: global.generateId()},
        version: 1
    }
    const msg = {
        ack: jest.fn()
    }
    return {listener, event, msg};
}

it('updates the status of the order', async () => {
    const {listener, event, msg} = await setup();
    await listener.OnMessage(event, msg as any);
    const order = await Order.findById(event.id);
    expect(order!.status).toEqual(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled();
});