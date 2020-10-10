#!/usr/bin/env node
"use strict";

import ADialog from "../_reactivestack/_a.dialog";
import Lorem from "../models/lorem";
import CollectionStore from "../_reactivestack/store/collection.store";
import DocumentStore from "../_reactivestack/store/document.store";

export default class LoremsBrowser extends ADialog {
	constructor() {
		super();

		const lorems = new CollectionStore(Lorem, "lorems");
		this.addSection(lorems);

		const selected = new DocumentStore(Lorem, "selected");
		this.addSection(selected);

		const selectedVersions = new CollectionStore(Lorem, "selectedVersions");
		this.addSection(selectedVersions);
	}
}
