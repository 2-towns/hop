import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";

export function number<This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>
) {
    const result: ClassAccessorDecoratorResult<This, number> = {
        get(this: This) {
            return target.get.call(this);
        },
        set(value: number) {
            if (value && isNaN(new Date(value).getTime())) {
                throw new HttpError(400, _("The field %s is not a number.", String(context.name)))
            }

            return target.set.call(this, value);
        }
    }
    return result;
}
