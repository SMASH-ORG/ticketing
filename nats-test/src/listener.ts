import * as nats from 'nats';
import * as crypto from 'crypto';
import {TicketCreatedListener, TicketUpdatedListener} from "./events/ticket-created-listener";

const main = async () => {
    // generate random hext token
    const nc = await nats.connect({
        servers: 'nats://localhost:4222',
        name: `listener-${crypto.randomBytes(16).toString('hex')}`
    })
    console.log("connected");

    const ticketCreatedListener = new TicketCreatedListener(nc);
    ticketCreatedListener.listen();

    const ticketUpdatedListener = new TicketUpdatedListener(nc);
    ticketUpdatedListener.listen();

    const cleanup = async () => {
        console.log('cleanup');
        await nc.drain()
        process.exit(0)
    }

    process.on('SIGINT', async () => {
        await cleanup()
    })
    process.on('SIGTERM', async () => {
        await cleanup()
    })
}


main()


