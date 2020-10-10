#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import uuidv4 from "../util/_f.unique.id";
import CollectionsModelsMap from "../_reactivestack/collections.models.map";

const DraftSchema = new Schema(
	{
		collectionName: {type: String, required: true},
		sourceDocumentId: {type: String, required: true},
		sourceDocumentItemId: {type: String, required: true, default: uuidv4()},
		createdBy: {type: String, required: true},
		document: {type: Object, required: true},
		meta: {type: Object, default: {}}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Draft = model("Draft", DraftSchema, "drafts");
CollectionsModelsMap.addCollectionToModelMapping(Draft);

export default Draft;