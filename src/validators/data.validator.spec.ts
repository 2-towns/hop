import assert from "node:assert";
import { describe, it } from "node:test";
import { HttpError } from "../errors/http-error.js";
import { date } from "./date.validator.js";
import { _ } from "../http/http-context.js";

class Example {
    @date
    accessor date: string

    constructor(date: string) {
        this.date = date
    }
}

describe("date validation", () => {
    it("does not throw an error when the creating an object with correct value", async () => {
        assert.doesNotThrow(() => new Example(new Date().toJSON()));
    });

    it("throws an error when the creating an object with bad value", async () => {
        assert.throws(
            () => new Example("hello"),
            new HttpError(400, _("The field date is not a date."))
        );
    });

    it("throws an error when the setting a bad value", async () => {
        const example = new Example(new Date().toJSON())
        assert.throws(
            () => example.date = "hello",
            new HttpError(400, _("The field date is not a date."))
        );
    });
});
