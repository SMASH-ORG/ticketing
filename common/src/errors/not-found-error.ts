import {CustomError} from "./custom-error";

export class NotFoundError extends CustomError {
    statusCode = 404;
    message: string;

    constructor(message: string = 'Resource Not Found') {
        super(message);
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, NotFoundError.prototype);
        this.message = message;
    }

    serializeErrors() {
        return [
            {message: this.message}
        ];
    }

}