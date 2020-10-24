#!/usr/bin/env node
'use strict';

import {model, Schema} from 'mongoose';

const DolorSchema = new Schema(
	{
		unde: {type: String},
		omnis: {type: String},
		iste: {type: Object},
		ipsumId: {
			type: Schema.Types.ObjectId,
			ref: 'Ipsum'
		},
		dolorId: {
			type: Schema.Types.ObjectId,
			ref: 'Dolor'
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);
export default model('Dolor', DolorSchema, 'dolors');
