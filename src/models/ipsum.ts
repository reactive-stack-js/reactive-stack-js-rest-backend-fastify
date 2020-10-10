#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";
import CollectionsModelsMap from "../_reactivestack/collections.models.map";

const IpsumSchema = new Schema(
	{
		sed: {type: String},
		ut: {type: String},
		perspiciatis: {type: Object},
		loremId: {
			type: Schema.Types.ObjectId,
			ref: "Lorem"
		}
	},
	{
		timestamps: true,
		versionKey: false,
	},
);
const Ipsum = model("Ipsum", IpsumSchema, "ipsums");
CollectionsModelsMap.addCollectionToModelMapping(Ipsum);

export default Ipsum;