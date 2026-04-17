import * as nats from 'nats';


export const natsWrapper = {
    client: {
        _mockPublish: jest.fn().mockImplementation(
            (subj: string, payload?: nats.Payload, options?: Partial<nats.JetStreamPublishOptions>): Promise<nats.PubAck> => {
                return new Promise((resolve, reject) => {
                    resolve({stream: subj, seq: 1, duplicate: false});
                })
            }),
        jetstream: function () {
            return {
                publish: this._mockPublish
            }
        }
    }
}


/*
import * as nats from 'nats';

export const natsWrapper = {
    client: {
        jetstream: jest.fn().mockImplementation(() => ({
            publish: jest.fn().mockImplementation(
                (subj: string, payload?: nats.Payload, options?: Partial<nats.JetStreamPublishOptions>): Promise<nats.PubAck> => {
                    return new Promise((resolve, reject) => {
                        resolve({stream: subj, seq: 1, duplicate: false});
                    })
                })
        }))
    }
}
 */