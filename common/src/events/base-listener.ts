import * as nats from "nats";
import {Event} from "./event";

export abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract consumerName: string;

    abstract OnMessage(data: T['data'], msg: nats.JsMsg): Promise<void>;

    protected nc: nats.NatsConnection;
    protected js: nats.JetStreamClient;
    protected ackWait = 5 * 1000 * 1000 * 1000; // 5 seconds

    constructor(nc: nats.NatsConnection) {
        this.nc = nc;
        this.js = nc.jetstream();
    }

    async init() {
        const jm = await this.js.jetstreamManager(true)
        try {
            await jm.streams.get(this.subject);
            console.log(`stream ${this.subject} already exists`);
        } catch (error) {
            await jm.streams.add({
                name: this.subject,
                subjects: [this.subject],
                discard: nats.DiscardPolicy.New,
                num_replicas: 3,
                storage: nats.StorageType.File,
                retention: nats.RetentionPolicy.Limits,
                allow_rollup_hdrs: true,
            })
            console.log(`stream ${this.subject} created`)
        }

        try {
            await jm.consumers.info(this.subject, this.consumerName)
            console.log(`consumer ${this.consumerName} for stream ${this.subject} already exists`)
        } catch (error) {
            try {
                await jm.consumers.add(this.subject, {
                    name: this.consumerName,
                    durable_name: this.consumerName,
                    ack_policy: nats.AckPolicy.Explicit,
                    ack_wait: this.ackWait,
                    max_deliver: 10
                });
                console.log(`consumer ${this.consumerName} for stream ${this.subject} created`)
            } catch (error) {
                console.error(`error creating consumer ${this.consumerName} for stream ${this.subject}`)
                console.log({error})
            }
        }
    }

    async listen() {
        await this.init();
        const consumer = await this.js.consumers.get(this.subject, this.consumerName,)
        const jc = nats.JSONCodec();

        for await (const m of await consumer.consume()) {
            const message = jc.decode(m.data);
            console.log({subject: m.subject, message, seq: m.seq});
            try {
                await this.OnMessage(message, m);
            } catch (err) {
                console.error(err)
            }
        }
    }
}