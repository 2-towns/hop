import assert from "node:assert";
import { describe, it } from "node:test";
import { Readable } from "node:stream";
import { HttpRequest } from "./http-request.js";
import { HttpError } from "../errors/http-error.js";

describe("http request", () => {
	it("parse a json request", async () => {
		const req: any = Readable.from(Buffer.from(JSON.stringify({ hello: "world" })))
		req.headers = { "content-type": "application/json" }

		type Return = { hello: string }
		const result = await HttpRequest.json<Return>(req)

		assert.ok(result.error == false)

		assert.strictEqual(result.data.hello, "world")
	})

	it("returns an error when the request is not json", async () => {
		const req: any = Readable.from(Buffer.from(JSON.stringify({ hello: "world" })))
		req.headers = {}

		const result = await HttpRequest.json<{}>(req)

		assert.ok(result.error)
		assert.deepStrictEqual(result.data, new HttpError(401))
	})

	it("returns an error when the request body is not a valid json", async () => {
		const req: any = Readable.from(Buffer.from("hello=world"))
		req.headers = { "content-type": "application/json" }

		const result = await HttpRequest.json<{}>(req)

		assert.ok(result.error)
		assert.strictEqual(result.data.code, 400)
	})

	it("parse a url-encoded request", async () => {
		const req: any = Readable.from(Buffer.from("hello=world&abc=1&abc=2"))
		req.headers = { "content-type": "application/x-www-form-urlencoded" }

		const result = await HttpRequest.urlEncoded(req)

		assert.ok(result.error == false)
		assert.strictEqual(result.data.get("hello")?.[0], "world")
		assert.strictEqual(result.data.get("abc")?.[0], "1")
		assert.strictEqual(result.data.get("abc")?.[1], "2")
	})


	it("returns an error when the request is not url-encoded", async () => {
		const req: any = Readable.from(Buffer.from("hello=world"))
		req.headers = {}

		const result = await HttpRequest.urlEncoded(req)

		assert.ok(result.error)
		assert.deepStrictEqual(result.data, new HttpError(401))
	})
})
