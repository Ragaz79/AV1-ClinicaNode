import { publicDecrypt } from "node:crypto"
import { string } from "zod"

export class AppError extends Error {
    constructor (
        message: string,
        public readonly statusCode = 400
    ) {
        super(message);
    }
}