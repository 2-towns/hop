import { AsyncLocalStorage } from "async_hooks";

class HttpContextClass extends AsyncLocalStorage<Map<string, any>> {
	get<T = string>(key: string): T | undefined {
		return this.getStore()?.get(key) as T;
	}

	override getStore(): Map<string, any> {
		return super.getStore() as Map<string, any>;
	}

	set(key: string, value: any) {
		return this.getStore()?.set(key, value);
	}
}

export const HttpContext = new HttpContextClass();

// The translation function can be updated in the context 
// to match with any translation package or dependency. 
export function _(s: string, ...interpolations: string[]) {
	return HttpContext.get<Function>("_")?.(s, interpolations) || interpolations.reduce((acc, cur) => acc.replace("%s", cur), s)
}
