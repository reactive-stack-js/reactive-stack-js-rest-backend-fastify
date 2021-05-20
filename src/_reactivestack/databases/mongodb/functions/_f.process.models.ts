#!/usr/bin/env node
'use strict';

import * as fs from 'fs';
import * as path from 'path';

import {filter} from 'lodash';

import CollectionsModelsMap from '../collections.models.map';

const _processFile = (folder: string, file: string): void => {
	const fullPath = path.join(folder, file);
	const model = require(fullPath).default;
	CollectionsModelsMap.addCollectionToModelMapping(model);
};

const processModels = (folder: string): void => {
	const fileNames = fs.readdirSync(folder);
	const files = filter(fileNames, (fileName: string) => !fs.lstatSync(path.join(folder, fileName)).isDirectory());
	files.forEach((file: string) => {
		const ext = path.extname(file);
		if (ext !== '.ts' && ext !== '.js') return;
		_processFile(folder, file);
	});

	const folders = filter(fileNames, (fileName: string) => fs.lstatSync(path.join(folder, fileName)).isDirectory());
	folders.forEach((sub: string) => processModels(path.join(folder, sub)));
};
export default processModels;
