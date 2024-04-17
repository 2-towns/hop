import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";

export function required<This>(
    target: ClassAccessorDecoratorTarget<This, string>,
    context: ClassAccessorDecoratorContext<This, string>
) {
    const result: ClassAccessorDecoratorResult<This, string> = {
        get(this: This) {
            return target.get.call(this);
        },
        set(value: string) {
            if (!value) {
                throw new HttpError(400, _("The field %s is required.", String(context.name)))
            }

            return target.set.call(this, value);
        }
    }
    return result;
}
