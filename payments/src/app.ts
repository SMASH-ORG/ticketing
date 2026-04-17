import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";


import {currentUser, errorHandler, NotFoundError} from "@smash1986/common";

import {natsWrapper} from "./nats-wrapper";
import {createChargeRouter} from "./routes/new";


const app = express();
app.set("trust proxy", true);
app.use((req, res, next) => {
    if (!req.url.match('/healthz|/livez|/readyz')) {
        console.log(req.url);
    }
    next();
});
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
}));
app.use(currentUser);
app.use(createChargeRouter);

app.get('/healthz', (req, res) => {
    if (natsWrapper.client.isClosed()) {
        res.status(500).send('NATS connection is closed')
        console.log('NATS connection is closed')
    } else {
        res.send('OK')
    }
})

app.all('*', async (req, res) => {
    throw new NotFoundError(`Route '${req.url}' not found`)
});

app.use(errorHandler);


export {app};