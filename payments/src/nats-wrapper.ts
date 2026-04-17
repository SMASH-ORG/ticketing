import * as nats from 'nats';


class NatsWrapper {
    private _nc?: nats.NatsConnection;

    async connect(servers: string, name: string) {
        this._nc = await nats.connect({
            servers,
            name
        });
    }

    get client() {
        if (!this._nc) {
            throw new Error('Cannot access NATS client before connecting');
        }

        return this._nc;
    }
}
export const natsWrapper = new NatsWrapper();