import { _ } from "../http/http-context.js"

export type Errable<T> = { error: false, data: T } | { error: true, data: HttpError }

const messages = {
	401: "You are not authorized to process the request",
	500: "Something went wrong.",
}

// HttpError is a custom Error class 
// that accepts a code error and a message. 
export class HttpError extends Error {
	code: number

	constructor(code: number, message = _(messages[code]) || "") {
		super(message)
		this.code = code
	}

	static isHttpError(e: any) {
		return e instanceof HttpError
	}

	static catch(e: any, code = 500, msg = ""): HttpError {
		if (e instanceof Error) {
			return new HttpError(code, e.message)
		}

		return new HttpError(code, msg)
	}
}
