import { readFile } from "fs/promises";
import { randomFillSync } from "node:crypto";
import { Errable, HttpError } from "../errors/http-error.js";
import path from "path";
import os from "os"

export const Files = {
	async read(filepath: string): Promise<Errable<Buffer>> {
		return readFile(filepath)
			.then(buf => ({ error: false as false, data: buf }))
			.catch(err => ({ error: true, data: HttpError.catch(err) }))
	},

	// Generate a tmp path for a file based on the os tmp folder. 
	tmp(extension: string) {
		const buf = Buffer.alloc(16);
		const random = randomFillSync(buf).toString("hex");
		const filename = `upload-${random}.${extension}`;

		return path.join(os.tmpdir(), filename);
	}
}
