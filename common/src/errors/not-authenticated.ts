import {CustomError} from "./custom-error";

export class NotAuthenticated extends CustomError {
    statusCode = 401;

    constructor() {
        super("Not Authenticated");
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, NotAuthenticated.prototype);
    }

    serializeErrors() {
        return [
            {message: 'Not Authenticated'}
        ];
    }
}