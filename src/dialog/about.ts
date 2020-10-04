#!/usr/bin/env node
'use strict';

import ADialog from '../_reactivestack/_a.dialog';

export default class AboutDialog extends ADialog {

	constructor() {
		super();
	}

	public async consume(message: any): Promise<any> {
		return true;
	};

	protected async load() {
		return true;
	}

	protected set config(config) {
		console.log('about config ignored...', config);
	}

}
