import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { Multipart } from "./multipart.js";
import { Readable } from "node:stream";

describe("multipart", () => {
	it("parse the stream", async () => {
		const image = readFileSync("resources/images/one-pixel.png")
		const text = readFileSync("resources/text/text.txt")

		let body = ""
		body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
		body += "Content-Disposition: form-data; name=\"id\"\r\n";
		body += "Content-Type: text/plain\r\n"
		body += "\r\n";
		body += "123e4567-e89b-12d3-a456-42665544000\r\n";
		body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
		body += "Content-Disposition: form-data; name=\"image\"; filename=\"image.png\"\r\n";
		body += "Content-Type: image/png\r\n"
		body += "\r\n"
		body += image.toString("binary")
		body += "\r\n"
		body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
		body += "Content-Disposition: form-data; name=\"text\"; filename=\"B.txt\"\r\n";
		body += "Content-Type: text/plain\r\n"
		body += "\r\n"
		body += text
		body += "\r\n"
		body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n";

		const buffer = Buffer.from(body, "binary")
		const fields = await Multipart.parse(Readable.from(buffer))

		// Wait than the write steam complete its job	
		await new Promise((resolve) => setTimeout(resolve, 100))

		assert.strictEqual(fields.get("id")?.[0], "123e4567-e89b-12d3-a456-42665544000")

		const imagepath = fields.get("image")?.[0]

		assert.ok(imagepath)
		assert.ok(existsSync(imagepath))
		assert.deepStrictEqual(image, readFileSync(imagepath))

		const textpath = fields.get("text")?.[0]

		assert.ok(textpath)
		assert.ok(existsSync(textpath))
		assert.deepStrictEqual(text, readFileSync(textpath))
	});
})
