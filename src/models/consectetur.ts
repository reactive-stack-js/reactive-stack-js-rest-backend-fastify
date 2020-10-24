#!/usr/bin/env node
'use strict';

import {model, Schema} from 'mongoose';

const ConsecteturSchema = new Schema(
	{
		natus: {type: String},
		fugiat: {type: String},
		voluptatem: {type: Object},
		dolorIds: {
			type: [Schema.Types.ObjectId],
			ref: 'Dolor'
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);
export default model('Consectetur', ConsecteturSchema, 'consecteturs');
