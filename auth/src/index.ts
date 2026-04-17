import * as mongoose from "mongoose";

import {app} from "./app";


const port = 3000;
const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    const mongoDBHost = process.env.MONGO_DB_HOST || 'mongo';
    await mongoose.connect(`mongodb://${mongoDBHost}:27017/auth`, {});
    console.log('Connected to MongoDB');

    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
}

start();

