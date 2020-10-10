#!/usr/bin/env node
"use strict";

import {AddressInfo} from "net";
import {Server, IncomingMessage, ServerResponse} from "http"
import * as path from "path";
import * as dotenv from "dotenv";

import {fastify, FastifyInstance} from "fastify";
import fastifyCors from "fastify-cors";
import fastifyBlipp from "fastify-blipp";
import fastifyHelmet from "fastify-helmet";
import * as fastifyJwt from "fastify-jwt";
import * as fastifyWebsocket from "fastify-websocket";

// must execute dotenv before importing anything that depends on process.env (like MongoDBConnector, for example)
dotenv.config({path: ".env.local"});

import websocket from "./_reactivestack/_f.websocket";
import addRoutes from "./util/_f.add.routes";
import MongoDBConnector from "./mongodb.connector";

// const fastify = Fastify({logger: false});
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({logger: false})

server.register(fastifyJwt, {secret: process.env.JWT_SECRET});
server.register(fastifyCors, {
	// put your options here
	origin: [
		"http://localhost:3003",
		"http://localhost:3004",
		"http://localhost:3005",
		"http://localhost:3006"
	]
});
server.register(fastifyBlipp);
server.register(fastifyHelmet);
server.register(fastifyWebsocket);

const addJWTHook = (srv) => {
	srv.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			// reply.send(err);
		}
	});
};

const addWebSocketListener = (srv) => srv.get("/ws", {websocket: true}, websocket);

// Run the server!
const startFastifyServer = async () => {
	try {
		MongoDBConnector.init();

		addJWTHook(server);

		addWebSocketListener(server);

		addRoutes(server, path.join(__dirname, "routes"));

		await server.listen(parseInt(process.env.PORT, 10));
		server.blipp();
		server.log.info(`Server listening on port ${(server.server.address() as AddressInfo).port}.`);

	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

startFastifyServer()
	.then(() => ({}))
	.catch((err) => console.error("Server Error:", err));

process.on("uncaughtException", (reason, p) => console.error("Uncaught Exception at:", p, "reason:", reason));
process.on("unhandledRejection", (reason, p) => console.error("Unhandled Rejection at:", p, "reason:", reason));
