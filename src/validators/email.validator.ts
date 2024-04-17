import { HttpError } from "../errors/http-error.js";
import { _ } from "../http/http-context.js";

// Use the email regex from w3C 
// https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html
export function email<This>(
    target: ClassAccessorDecoratorTarget<This, string>,
    context: ClassAccessorDecoratorContext<This, string>
) {
    const result: ClassAccessorDecoratorResult<This, string> = {
        get(this: This) {
            return target.get.call(this);
        },
        set(value: string) {
            const regex = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
            if (regex.test(value) == false) {
                throw new HttpError(400, _("The field %s is not an email.", String(context.name)))
            }

            return target.set.call(this, value);
        }
    }
    return result;
}
