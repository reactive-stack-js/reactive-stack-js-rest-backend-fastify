#!/usr/bin/env node
"use strict";

import {v4} from "uuid";
import {model, Schema} from "mongoose";

const DraftSchema = new Schema(
	{
		collectionName: {type: String, required: true},
		sourceDocumentId: {type: String, required: true},
		sourceDocumentItemId: {type: String, required: true, default: v4()},
		createdBy: {type: String, required: true},
		document: {type: Object, required: true},
		meta: {type: Object, default: {}}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
export default model("Draft", DraftSchema, "drafts");