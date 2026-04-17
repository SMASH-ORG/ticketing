import * as nats from 'nats';
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

const main = async () => {
    const nc = await nats.connect({servers: 'nats://localhost:4222', name: 'publisher'})
    console.log("connected");


    await new TicketCreatedPublisher(nc).publish({
        id: '123',
        title: 'concert',
        price: 20,
        userId: 'user-123'
    })

}

main();



