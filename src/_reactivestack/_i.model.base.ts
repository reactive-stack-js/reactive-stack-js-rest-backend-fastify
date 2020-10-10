#!/usr/bin/env node
"use strict";

const SyncModelBaseAttributes = {
	itemId: {type: String, required: true},
	iteration: {type: Number, required: true},
	isLatest: {type: Boolean, required: true},
	createdAt: {type: Date, default: Date.now, required: true},
	createdBy: {type: String, required: false},
	updatedAt: {type: Date, required: false},
	updatedBy: {type: String, required: false},
	isDraft: {type: Boolean, required: false},
	meta: {type: Object, required: false}
};

export default SyncModelBaseAttributes;