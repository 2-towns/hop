import { WriteStream, createWriteStream } from "fs";
import { Files } from "../files/files.js";
import path from "path";
import { Readable } from "stream";

const Parts = {
    // Return true if the buffer should resume a previous part.  
    // When the data length is more then the chunk size, 
    // the full data content (mostly a file) will be separated into multiple chunks. 
    // In this case, the chunk should not contains the "Content-Disposition" line, 
    // but the raw data of the resumed file. 
    resumable(chunk: Buffer, boundary: string) {
        const end = chunk.indexOf("\r\n" + boundary)
        return chunk.subarray(0, end).indexOf("Content-Disposition") === -1
    },
}

// Iterate across the buffer 
class PartIterator {
    from: number
    end: number
    chunk: Buffer
    boundary: string

    constructor(chunk: Buffer, boundary: string) {
        this.chunk = chunk
        this.boundary = boundary
        this.from = 0
        this.end = chunk.indexOf("\r\n" + boundary)
    }

    // Returns the current part with metadata
    part() {
        return this.chunk
            .subarray(this.from, this.end)
    }

    // Returns the raw data 
    data() {
        const separator = "\r\n\r\n"
        const part = this.part()
        return part.subarray(part.indexOf(separator) + Buffer.byteLength(separator), this.end);
    }

    // Go to the next part.
    // A new part should start in a new line, 
    // and the end can be detected with a new line plus the boundary sequence.  
    next() {
        this.from = this.end + Buffer.byteLength("\r\n")
        this.end = this.chunk.indexOf("\r\n" + this.boundary, this.from)
    }

    hasNext() {
        return this.end !== -1
    }
}

class Fields {
    data = new Map<string, string[]>()

    add(field: Field | null) {
        if (!field) {
            return
        }

        let prev = this.data.get(field.name)

        if (prev == null) {
            prev = []
            this.data.set(field.name, prev)
        }

        this.data.set(field.name, [...prev, field.value])
    }

}

class Field {
    name: string
    value: string
    filename: string | undefined
    stream: WriteStream | null = null

    // Constructs a field from the current part. 
    // It will extract the content disposition
    // and generate a tmp path for the fiels if it the data is a file. 
    constructor(chunk: Buffer) {
        const cdi = chunk.indexOf("Content-Disposition")
        const cde = chunk.indexOf("\r\n", cdi)
        const cd = chunk.subarray(cdi, cde).toString()

        const [, name, file] = cd.toString().split(`;`);
        this.name = name.replace(` name="`, "").replace(`"`, "")
        this.value = ""

        if (file) {
            this.filename = file.replace(` filename="`, "").replace(`"`, "")

            const extension = path.extname(this.filename).replace(".", "")

            this.value = Files.tmp(extension)
            this.stream = createWriteStream(this.value)
        }
    }

    write(chunk: Buffer) {
        if (this.stream) {
            this.stream.write(chunk)
        } else {
            this.value += chunk.toString()
        }
    }

    close() {
        this.stream?.close()
    }
}

export const Multipart = {
    // Parse the chunks from a multipart body using steams. 
    // The streams related to the file writing are totally async, so 
    // the parse function does not wait that the file writing is completed. 
    async parse(stream: Readable) {
        const fields = new Fields()

        let boundary = ""
        let field: Field | null = null

        for await (const chunk of stream) {
            if (!boundary) {
                boundary = chunk.toString("binary").split("\r\n")[0];
            }

            const it = new PartIterator(chunk, boundary)

            if (Parts.resumable(chunk, boundary)) {
                field?.write(it.data())
                it.next()
            }

            while (it.hasNext()) {
                field?.close()
                fields.add(field)

                field = new Field(it.part())
                field.write(it.data())

                it.next()
            }
        }

        field?.close()
        fields.add(field)

        return fields.data
    }
}
