#!/usr/bin/env node
"use strict";

import * as _ from "lodash";
import {Subject, Subscription} from "rxjs";
import AStore from "./store/_a.store";
// import * as jsondiffpatch from "jsondiffpatch";

export default abstract class ADialog extends Subject<any> {

	protected _config: any;
	protected _sections: AStore[];
	protected _subscriptions: Subscription;

	protected constructor() {
		super();
		this._config = {};
		this._sections = [];
		this._subscriptions = new Subscription();
	}

	protected set config(config: any) {
		if (!this._isValidConfig(config)) return;

		this._config = _.cloneDeep(config);
		_.each(this._sections, (section: AStore) => section.config = _.get(config, section.field));
	}

	public addSection(section: AStore): ADialog {
		this._sections.push(section);
		const subscription = section.subscribe({
			next: (m: any) => this.next(m),
			error: (e: any) => this.error(e),
			complete: () => this.complete()
		});
		this._subscriptions.add(subscription);
		return this;
	}

	public async consume(message: any): Promise<any> {
		switch (message.type) {
			case "config":
				const {config} = message;
				this.config = config;
				return;
		}
	};

	public destroy() {
		this._subscriptions.unsubscribe();
		this._subscriptions = null;

		_.each(this._sections, (section: AStore) => {
			section.destroy();
			section = null;
		});
		this._sections = null;
	}

	private _isValidConfig(config: object): boolean {
		return !!config;

		// NOTE: this optimization messes with VueJS live reload functionality
		// const diff = jsondiffpatch.diff(this._config, config);
		// return !_.isEmpty(diff);
	}

}
