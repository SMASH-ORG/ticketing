import {CustomError} from "./custom-error";

export class NotAuthorized extends CustomError {
    statusCode = 403;

    constructor() {
        super("Not Authenticated");
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, NotAuthorized.prototype);
    }

    serializeErrors() {
        return [
            {message: 'Not NotAuthorized'}
        ];
    }
}