import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import {TicketDoc} from "../models/ticket";
import {Order, OrderDoc} from "../models/orders";
import {OrderStatus} from "@smash1986/common";


declare global {
    var signup: (email?: string, id?: string) => Promise<string[]>;
    var generateId: () => string;
    var createOrder: (ticket: TicketDoc) => OrderDoc;
}
jest.mock('../nats-wrapper.ts');

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'smash';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signup = async (email: string = 'm@m.com', id: string = '1234') => {
    const payload = {
        email,
        id
    }
    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '1d'
    })
    const encoded = Buffer.from(JSON.stringify({jwt: token})).toString('base64')
    return [`session=${encoded}`];
}

global.generateId = () => {
    return new mongoose.Types.ObjectId().toHexString();
}
global.createOrder = (ticket: TicketDoc) => {
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + 300);
    return Order.build({
        ticket,
        userId: '1234',
        status: OrderStatus.Created,
        expiresAt: expiration
    })
}