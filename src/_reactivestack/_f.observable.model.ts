#!/usr/bin/env node
"use strict";

import * as _ from "lodash";
import {Subject} from "rxjs";
import {ChangeStream} from "mongodb";

// TODO: add USER param to be able to CHECK PERMISSIONS in ObservableModelsMap
export default (model: any) => ObservableModelsMap.get(model);

class ObservableModel extends Subject<any> {
	private _model: any;
	private _stream: ChangeStream;

	constructor(model) {
		super();
		this._model = model;
		this._stream = this._model.watch([], {fullDocument: "updateLookup"});

		this._stream.on("change", (change) => {
			// you can also just forward the entire change object: this.next(change);
			this.next(_.pick(change, ["ns", "documentKey", "operationType", "updateDescription", "fullDocument"]));
		});
	}
}

class ObservableModelsMap {
	// TODO: add USER param and CHECK PERMISSIONS!
	public static get(model): ObservableModel {
		const map = this._map;
		const modelName = model.collection.collectionName;
		if (!map.get(modelName)) map.set(modelName, new ObservableModel(model));
		return map.get(modelName);
	}

	private static readonly _map = new Map<string, ObservableModel>();

	private constructor() {
	}
}

// @TODO nice2have: stop stream when no subscribers / restart stream on subscribe... not MVP:
// this._stream.close();
// observableModels.delete(id);
