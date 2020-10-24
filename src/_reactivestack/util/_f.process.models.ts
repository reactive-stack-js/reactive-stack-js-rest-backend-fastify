#!/usr/bin/env node
"use strict";

import * as fs from "fs";
import * as path from "path";

import * as _ from "lodash";

import CollectionsModelsMap from "./collections.models.map";

const _processFile = (folder: string, file: string): void => {
	const fullPath = path.join(folder, file);
	const model = require(fullPath).default;
	CollectionsModelsMap.addCollectionToModelMapping(model);
};

const processModels = (folder: string): void => {
	const fileNames = fs.readdirSync(folder);
	const files = _.filter(fileNames, (fileName) => !fs.lstatSync(path.join(folder, fileName)).isDirectory());
	files.forEach((file) => {
		const ext = path.extname(file);
		if (ext !== ".ts" && ext !== ".js") return;
		_processFile(folder, file);
	});

	const folders = _.filter(fileNames, (fileName) => fs.lstatSync(path.join(folder, fileName)).isDirectory());
	folders.forEach((subfolder) => processModels(subfolder));
};
export default processModels;
