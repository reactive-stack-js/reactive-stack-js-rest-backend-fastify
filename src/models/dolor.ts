#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import CollectionsModelsMap from "../_reactivestack/collections.models.map";

const DolorSchema = new Schema(
	{
		unde: {type: String},
		omnis: {type: String},
		iste: {type: Object},
		ipsumId: {
			type: Schema.Types.ObjectId,
			ref: "Ipsum"
		},
		dolorId: {
			type: Schema.Types.ObjectId,
			ref: "Dolor"
		}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Dolor = model("Dolor", DolorSchema, "dolors");
CollectionsModelsMap.addCollectionToModelMapping(Dolor);

export default Dolor;
