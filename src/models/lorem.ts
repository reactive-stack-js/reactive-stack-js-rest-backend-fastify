#!/usr/bin/env node
'use strict';

import {v4 as uuidv4} from 'uuid';
import {model, Schema} from 'mongoose';

const LoremSchema = new Schema(
	{
		itemId: {type: String, required: true, default: uuidv4()},
		iteration: {type: Number, required: true},
		isLatest: {type: Boolean, required: true},
		firstname: {type: String, required: true, index: true},
		lastname: {type: String, required: true, index: true},
		username: {type: String, required: true, index: true},
		email: {type: String, required: true, index: true},
		species: {type: String, required: true},
		rating: {type: Number, required: true},
		description: {type: String, required: true},
		createdBy: {type: String, required: false},
		updatedBy: {type: String, required: false}
	},
	{
		timestamps: true,
		versionKey: false
	}
);
export default model('Lorem', LoremSchema, 'lorems');
