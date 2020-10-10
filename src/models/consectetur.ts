#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import CollectionsModelsMap from "../_reactivestack/collections.models.map";

const ConsecteturSchema = new Schema(
	{
		natus: {type: String},
		fugiat: {type: String},
		voluptatem: {type: Object},
		dolorIds: {
			type: [Schema.Types.ObjectId],
			ref: "Dolor"
		}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Consectetur = model("Consectetur", ConsecteturSchema, "consecteturs");
CollectionsModelsMap.addCollectionToModelMapping(Consectetur);

export default Consectetur;