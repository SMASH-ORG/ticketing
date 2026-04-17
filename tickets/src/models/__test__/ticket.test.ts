import {Ticket} from "../ticket";
import {Error} from 'mongoose';

it('implement optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123',
    });
    await ticket.save();
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});
    await firstInstance!.save();

    await expect(async () => {
        await secondInstance!.save();
    }).rejects.toThrow(Error.VersionError);

});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});