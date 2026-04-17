import * as nats from 'nats';
import {Event} from "./event";

export abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];

    private nc: nats.NatsConnection;
    private js: nats.JetStreamClient;

    constructor(nc: nats.NatsConnection) {
        this.nc = nc;
        this.js = nc.jetstream();
    }

    async publish(data: T['data']) {
        const jc = nats.JSONCodec();
        const ack = await this.js.publish(this.subject, jc.encode(data));
        console.log({ack});
    }
}
