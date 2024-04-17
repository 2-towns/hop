import etag from "etag";
import { ServerResponse } from "http";
import { HttpRequest } from "./http-request.js";

export const HttpResponse = {
	// Add headers to cache a response. 
	// It will calculate an etag value and add it to the headers. 
	// A vary header is added for HX-Request, to separate caching 
	// between classical http request and htmx request. 
	cache(res: ServerResponse, html: string) {
		const e = etag(html);
		res.setHeader("Etag", e)
		res.setHeader("Cache-Control", "no-cache")
		res.setHeader("Vary", "HX-Request")
	},

	// Returns an empty request not modified (304). 
	notModifed(res: ServerResponse) {
		res.writeHead(304, {
			"Cache-Control": "no-cache",
		});
		res.end();
	},

	json(res: ServerResponse, data: unknown, status = 200) {
		const s = JSON.stringify(data);
		const buffer = Buffer.from(s);

		res.writeHead(status, "", {
			"Content-Type": "application/json",
			"Content-Length": buffer.length,
		});
		res.write(JSON.stringify(data));
		res.end();
	},

	// Make an http redirection with 302 as default code. 
	// If the request is coming from htmx, an header "HX-Redirect" is 
	// added instead of sending 302 response. 
	redirect(res: ServerResponse, location: string, code = 302) {
		if (HttpRequest.isHtmx(res.req)) {
			res.writeHead(200, {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Expires: "0",
				Pragma: "no-cache",
				"HX-Redirect": location,
			});
		} else {
			res.writeHead(code, {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Expires: "0",
				Pragma: "no-cache",
				Location: location,
			});
		}
		res.end();
	},

	// Set multiple headers which should be added in any requests. 
	setSecurityHeaders(res: ServerResponse) {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader("Referrer-Policy", "strict-origin");
		res.setHeader("X-Frame-Options", "deny");
		res.setHeader(
			"Strict-Transport-Security",
			"max-age=63072000; includeSubDomains; preload",
		);
		res.setHeader("X-XSS-Protection", "1");
		res.setHeader("Date", new Date().toUTCString());
	}
}
