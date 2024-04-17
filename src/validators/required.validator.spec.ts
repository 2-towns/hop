import assert from "node:assert";
import { describe, it } from "node:test";
import { HttpError } from "../errors/http-error.js";
import { required } from "./required.validator.js";
import { _ } from "../http/http-context.js";

class Example {
    @required
    accessor title: string

    constructor(title: string) {
        this.title = title
    }
}

describe("required validation", () => {
    it("throws an error when the creating an object with empty value", async () => {
        assert.throws(
            () => new Example(""),
            new HttpError(400, _("The field title is required."))
        );
    });

    it("throws an error when the setting an empty value", async () => {
        const example = new Example("test")
        assert.throws(
            () => example.title = "",
            new HttpError(400, _("The field title is required."))
        );
    });
});
