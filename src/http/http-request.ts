import { IncomingMessage } from "node:http"
import { Errable, HttpError } from "../errors/http-error.js"
import { Multipart } from "./multipart.js"

export const HttpRequest = {
	url(req: IncomingMessage) {
		return req.url || ""
	},
	// Return true if the request contains a header 
	// "hx-request" with the value "true". 
	isHtmx(req: IncomingMessage) {
		return req.headers["hx-request"] === "true"
	},
	// Return true if the request method is POST.
	isPost(req: IncomingMessage) {
		return req.method === "POST"
	},
	// Return true if the request header content-type contains 
	// application/json. 
	isJson(req: IncomingMessage) {
		return req.headers["content-type"]?.includes("application/json")
	},
	// Return true if the request header content-type contains 
	// application/x-www-form-urlencoded
	isUrlEncoded(req: IncomingMessage) {
		return req.headers["content-type"]?.includes(
			"application/x-www-form-urlencoded"
		)
	},
	// Return true if the request header content-type contains 
	// "multipart/form-data". 
	isMultipart(req: IncomingMessage) {
		return req.headers["content-type"]?.includes(
			"multipart/form-data"
		)
	},
	// Return the concatened chunks of the request as one buffer  
	async buffer(req: IncomingMessage) {
		const chunks: Uint8Array[] = [];

		for await (const chunk of req) {
			chunks.push(chunk);
		}

		return Buffer.concat(chunks)
	},
	// Parse a url-encoded request and return values as a Map. 
	// If the request is not url-encoded, an unauthorized error (401) is returned. 
	async urlEncoded(req: IncomingMessage): Promise<Errable<Map<string, string[]>>> {
		if (!this.isUrlEncoded(req)) {
			return { error: true, data: new HttpError(401) }
		}

		const buffer = await this.buffer(req);

		const data = new Map<string, string[]>()
		const params = new URLSearchParams(buffer.toString())
		const keys = params.keys()

		for (const key of keys) {
			data.set(key, params.getAll(key))
		}

		return { error: false, data }
	},

	// Parse a json request and return values as an object. 
	// If the request is not json, an unauthorized error (401) is returned. 
	async json<T extends Object>(req: IncomingMessage): Promise<Errable<T>> {
		if (!this.isJson(req)) {
			return { error: true, data: new HttpError(401) }
		}

		const buffer = await this.buffer(req);
		try {
			const json = JSON.parse(buffer.toString())
			return { error: false, data: json }
		} catch (e) {
			return { error: true, data: HttpError.catch(e, 400) }
		}
	},


	// Parse a multipart request and return values as a Map. 
	// For the files, the map will contain the related tmp path. 
	// In your business logic, after validation, you can move this path 
	// to a more adequat folder. 
	// If the request is multipart, an unauthorized error (401) is returned. 
	async multipart(req: IncomingMessage): Promise<Errable<Map<string, string[]>>> {
		if (!this.isMultipart(req)) {
			return { error: true, data: new HttpError(401) }
		}

		const data = await Multipart.parse(req)

		return { error: false, data }
	}
}
