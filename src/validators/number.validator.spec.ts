import assert from "node:assert";
import { describe, it } from "node:test";
import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";
import { number } from "./number.validator.js";

class Example {
    @number
    accessor weight: number

    constructor(weight: number) {
        this.weight = weight
    }
}

describe("number validation", () => {
    it("does not throw an error when the creating an object with correct value", async () => {
        assert.doesNotThrow(() => new Example(1));
    });

    it("throws an error when the creating an object with bad value", async () => {
        assert.throws(
            () => new Example(Number("hello")),
            new HttpError(400, _("The field weight is not a number."))
        );
    });

    it("throws an error when the setting a bad value", async () => {
        const example = new Example(1)
        assert.throws(
            () => example.weight = Number("hello"),
            new HttpError(400, _("The field weight is not a number."))
        );
    });
});
