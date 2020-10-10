#!/usr/bin/env node
"use strict";

import uuidv4 from "../util/_f.unique.id";

const SyncModelBaseAttributes = {
	itemId: {type: String, required: true, default: uuidv4()},
	iteration: {type: Number, required: true},
	isLatest: {type: Boolean, required: true},
	createdBy: {type: String, required: false},
	updatedBy: {type: String, required: false},
	meta: {type: Object, required: false}
};

export default SyncModelBaseAttributes;