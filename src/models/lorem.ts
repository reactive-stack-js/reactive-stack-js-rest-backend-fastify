#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import SyncModelBaseAttributes from "../_reactivestack/_i.model.base";
import CollectionsModelsMap from "../_reactivestack/collections.models.map";

const LoremSchema = new Schema(
	{
		...SyncModelBaseAttributes,
		firstname: {type: String, required: true, index: true},
		lastname: {type: String, required: true, index: true},
		username: {type: String, required: true, index: true},
		email: {type: String, required: true, index: true},
		species: {type: String, required: true},
		rating: {type: Number, required: true},
		description: {type: String, required: true},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Lorem = model("Lorem", LoremSchema, "lorems");
CollectionsModelsMap.addCollectionToModelMapping(Lorem);

export default Lorem;