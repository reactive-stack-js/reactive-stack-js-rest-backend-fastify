#!/usr/bin/env node
"use strict";

import ADialog from "../_reactivestack/_a.dialog";
import Lorem from "../models/lorem";
import DocumentStore from "../_reactivestack/store/document.store";

export default class LoremEditor extends ADialog {
	constructor() {
		super();

		const lorem = new DocumentStore(Lorem, "lorem");
		this.addSection(lorem);
	}
}
