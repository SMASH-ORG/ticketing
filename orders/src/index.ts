import * as mongoose from "mongoose";

import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";
import {TicketCreatedListener} from "./events/listeners/ticket-created-listener";
import {TicketUpdatedListener} from "./events/listeners/ticket-updated-listener";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {PaymentCreatedListener} from "./events/listeners/payment-created-listener";


const port = 3000;
const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }

    const natsClientName = process.env.NATS_CLIENT_NAME || process.env.HOSTNAME!;

    await natsWrapper.connect(process.env.NATS_URL, natsClientName);
    const natsCleanup = async () => {
        console.log('natsCleanup');
        await natsWrapper.client.drain()
        process.exit(0)
    }

    process.on('SIGINT', async () => {
        console.log('Received SIGINT');
        await natsCleanup()
    })
    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM');
        await natsCleanup()
    })

    const mongoDBHost = process.env.MONGO_DB_HOST || 'mongo';
    await mongoose.connect(`mongodb://${mongoDBHost}:27017/orders`, {});
    console.log('Connected to MongoDB');

    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
}

start();
