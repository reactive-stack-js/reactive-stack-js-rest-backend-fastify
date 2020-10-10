#!/usr/bin/env node
"use strict";

import * as http from "http";

declare module "fastify" {
	// tslint:disable-next-line:interface-name
	export interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
		// @ts-ignore
		blipp(): void;
	}
}
