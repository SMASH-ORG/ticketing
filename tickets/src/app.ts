import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";


import {currentUser, errorHandler, NotFoundError} from "@smash1986/common";
import {createTicketRouter} from "./routes/new";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";
import {natsWrapper} from "./nats-wrapper";


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
app.use(currentUser)
app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

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