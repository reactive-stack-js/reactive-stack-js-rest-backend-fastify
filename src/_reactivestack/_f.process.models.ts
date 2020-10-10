#!/usr/bin/env node
"use strict";

import * as fs from "fs";
import * as path from "path";

import * as _ from "lodash";
import CollectionsModelsMap from "./collections.models.map";

const _processFile = (folder: string, file: string): boolean => {
	const fullPath = path.join(folder, file);
	const model = require(fullPath).default;
	CollectionsModelsMap.addCollectionToModelMapping(model);
	return true;
};

const _processFolder = (folder: string): boolean => {
	const fileNames = fs.readdirSync(folder);
	const files = _.filter(fileNames, (fileName) => !fs.lstatSync(path.join(folder, fileName)).isDirectory());
	files.forEach((file) => {
		const ext = path.extname(file);
		if (ext !== ".ts" && ext !== ".js") return;
		_processFile(folder, file);
	});

	const folders = _.filter(fileNames, (fileName) => fs.lstatSync(path.join(folder, fileName)).isDirectory());
	folders.forEach((subfolder) => {
		_processFolder(subfolder);
	});

	return true;
};

const processModels = (folder: string): any => {
	return _processFolder(folder);
};
export default processModels;
