#!/usr/bin/env node
"use strict";

import {model, Schema} from "mongoose";

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
export default model("Ipsum", IpsumSchema, "ipsums");