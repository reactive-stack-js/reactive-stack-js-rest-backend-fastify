#!/usr/bin/env node
"use strict";

import * as fs from "fs";
import * as path from "path";

import * as _ from "lodash";

const METHODS = ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"];
const _addRoute = (fastify, route) => {
	if (_.has(route, "method")) route.method = _.toUpper(route.method);
	if (_.isPlainObject(route) && METHODS.includes(route.method)) {
		fastify.route(route);
	}
};

const addRoutes = (fastify, folder) => {
	const fileNames = fs.readdirSync(folder);

	const files = _.filter(fileNames, (name) => !fs.lstatSync(path.join(folder, name)).isDirectory());
	files.forEach((file) => {
		const name = path.basename(file, ".js");
		const route = require(path.join(folder, name));
		if (_.isArray(route)) _.each(route, (r) => _addRoute(fastify, r));
		else _addRoute(fastify, route);
	});

	const folders = _.filter(fileNames, (name) => fs.lstatSync(path.join(folder, name)).isDirectory());
	folders.forEach((file) => addRoutes(fastify, path.join(folder, file)));
};

export default addRoutes;
