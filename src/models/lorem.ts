#!/usr/bin/env node
'use strict';

import {model, Schema} from 'mongoose';
import SyncModelBaseAttributes from "../_reactivestack/_i.model.base";
import CollectionsModelsMap from "../util/collections.models.map";

const LoremSchema = new Schema(
	{
		...SyncModelBaseAttributes,
		firstname: {type: String, required: true},
		lastname: {type: String, required: true},
		username: {type: String, required: true},
		email: {type: String, required: true},
		species: {type: String, required: true},
		rating: {type: Number, required: true},
		description: {type: String, required: true}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Lorem = model('Lorem', LoremSchema, 'lorems');
CollectionsModelsMap.addCollectionToModelMapping(Lorem);

export default Lorem;