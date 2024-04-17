import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";

export function date<This>(
    target: ClassAccessorDecoratorTarget<This, string>,
    context: ClassAccessorDecoratorContext<This, string>
) {
    const result: ClassAccessorDecoratorResult<This, string> = {
        get(this: This) {
            return target.get.call(this);
        },
        set(value: string) {
            if (value && isNaN(new Date(value).getTime())) {
                throw new HttpError(400, _("The field %s is not a date.", String(context.name)))
            }

            return target.set.call(this, value);
        }
    }
    return result;
}
