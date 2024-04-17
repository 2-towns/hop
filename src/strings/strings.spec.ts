import assert from "node:assert";
import { describe, it } from "node:test";
import { Strings } from "./strings.js";

describe("strings", () => {
    it("sanitize data", async () => {
        assert.strictEqual(Strings.sanitize("hello&'\"<>"), "hello&amp;&#39;&quot;&lt;&gt;")
    })
})
