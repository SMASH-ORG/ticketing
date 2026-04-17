import * as mongoose from "mongoose";

import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {OrderCancelledListener} from "./events/listeners/order-cancelled-listener";
import {OrderUpdatedListener} from "./events/listeners/order-updated-listener";


const port = 3000;
const start = async () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY must be defined');
    }

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
    await mongoose.connect(`mongodb://${mongoDBHost}:27017/payments`, {});
    console.log('Connected to MongoDB');

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderUpdatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
}

start();

