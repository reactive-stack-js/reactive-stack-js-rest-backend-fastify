#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import uuidv4 from "../_reactivestack/util/_f.unique.id";

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
export default model("Draft", DraftSchema, "drafts");