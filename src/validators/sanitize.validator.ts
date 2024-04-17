import { _ } from "../http/http-context.js";
import { Strings } from "../strings/strings.js";

export function sanitize<This>(
    target: ClassAccessorDecoratorTarget<This, string>,
    _: ClassAccessorDecoratorContext<This, string>
) {
    const result: ClassAccessorDecoratorResult<This, string> = {
        get(this: This) {
            return Strings.sanitize(target.get.call(this))
        },
        set(value: string) {
            return target.set.call(this, value);
        }
    }
    return result;
}
