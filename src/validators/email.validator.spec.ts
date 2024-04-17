import assert from "node:assert";
import { describe, it } from "node:test";
import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";
import { email } from "./email.validator.js";

class Example {
    @email
    accessor email: string

    constructor(email: string) {
        this.email = email
    }
}

describe("email validation", () => {
    it("does not throw an error when the creating an object with correct value", async () => {
        assert.doesNotThrow(() => new Example("hello@world.com"));
    });

    it("throws an error when the creating an object with bad value", async () => {
        assert.throws(
            () => new Example("hello"),
            new HttpError(400, _("The field email is not an email."))
        );
    });

    it("throws an error when the setting a bad value", async () => {
        const example = new Example("hello@world.com")
        assert.throws(
            () => example.email = "hello",
            new HttpError(400, _("The field email is not an email."))
        );
    });
});
