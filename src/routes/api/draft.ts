#!/usr/bin/env node
'use strict';

import {each, first, get, includes, keys, omit, set, uniq} from 'lodash';

import {Model, Types} from 'mongoose';
import Draft from '../../models/draft';
import CollectionsModelsMap from '../../_reactivestack/util/collections.models.map';

const _hasItemId = (model: Model<any>): boolean => includes(keys(model.schema.paths), 'itemId');

const _validate = (request: any, reply: any, done: Function): void => {
	// IMPODTANT: do NOT use plain done() without params in POST - it doubles the call for some reason...

	// console.log("_validate user:", request.user.id, request.user.name);
	// verify permissions
	// if fail use: done(..something..); to break process and return ..something..
	done();
};

module.exports = [
	{
		method: 'POST',
		url: 'focus/:draftId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				user,
				params: {draftId},
				body: {field}
			} = request;
			const userId = user.id;

			const draft = await Draft.findOne({_id: draftId});
			if (!draft) throw new Error(`Draft does not exist: ${draftId}`);

			let meta = get(draft, 'meta', {});
			if (get(meta, field)) return reply.send(false);

			each(meta, (val, id) => {
				if (get(val, 'user', false) === userId) meta = omit(meta, id);
			});
			set(meta, field, {user: userId});
			await Draft.updateOne({_id: draftId}, {$set: {meta}});

			reply.send(true);
		}
	},

	{
		method: 'POST',
		url: 'blur/:draftId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				user,
				params: {draftId},
				body: {field}
			} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			if (!draft) throw new Error(`Draft does not exist: ${draftId}`);

			const meta = get(draft, 'meta', null);
			if (meta) {
				const curr = get(meta, field);
				if (curr) {
					const focusedBy = get(curr, 'user');
					if (focusedBy !== userId) reply.send(false);
					const metaData = omit(meta, field);
					await Draft.updateOne({_id: draftId}, {$set: {meta: metaData}});
				}
			}

			reply.send(true);
		}
	},

	{
		method: 'POST',
		url: 'change/:draftId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				user,
				params: {draftId},
				body: {field, value}
			} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			if (draft) {
				let {document} = draft;
				document = set(document, field, value);

				let {changes} = draft;
				changes.push(field);
				changes = uniq(changes);

				const updater = {
					updatedBy: userId,
					updatedAt: new Date(),
					document,
					changes
				};
				return reply.send(await Draft.updateOne({_id: draftId}, {$set: updater}));
			}
			reply.send({draftId, change: {field, value}, userId, error: 'Draft does not exist!'});
		}
	},

	{
		method: 'GET',
		url: 'create/:collectionName/:sourceDocumentId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				user,
				params: {collectionName, sourceDocumentId}
			} = request;
			const userId = user.id;

			const model = CollectionsModelsMap.getModelByCollection(collectionName);
			if (!model) throw new Error(`Model not found for collectionName ${collectionName}`);

			const document = await model.findOne({_id: sourceDocumentId});

			const hasItemId = _hasItemId(model);
			let draftQuery: any = {collectionName, sourceDocumentId};
			if (hasItemId) draftQuery = {collectionName, sourceDocumentItemId: document.itemId};

			let existing: any = await Draft.findOne(draftQuery);
			if (!existing) {
				const draft: any = {_id: Types.ObjectId(), collectionName, sourceDocumentId};
				if (hasItemId) draft.sourceDocumentItemId = document.itemId;
				draft.document = omit(document, ['_id', 'updatedAt', 'updatedBy']);
				draft.meta = {};
				draft.createdBy = userId;
				existing = await Draft.create(draft);
			}

			reply.send(existing._id);
		}
	},

	{
		method: 'GET',
		url: 'cancel/:draftId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				params: {draftId}
			} = request;
			await Draft.deleteOne({_id: draftId});
			reply.send(true);
		}
	},

	{
		method: 'GET',
		url: 'save/:draftId',
		preValidation: _validate,
		handler: async (request: any, reply: any): Promise<void> => {
			const {
				user,
				params: {draftId}
			} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			const {collectionName} = draft;

			const model = CollectionsModelsMap.getModelByCollection(collectionName);
			if (!model) throw new Error(`Model not found for collectionName ${collectionName}`);

			const document = omit(draft.document, ['_id', 'createdAt']);

			let max: any = await model.find({itemId: document.itemId}).sort({iteration: -1}).limit(1);
			max = first(max);
			await model.updateOne({_id: max._id}, {$set: {isLatest: false}});

			document.isLatest = true;
			document.iteration = max.iteration + 1;
			document.createdBy = userId;
			document.createdAt = new Date();

			await Draft.deleteOne({_id: draftId});
			const dbDocument = await model.create(document);
			reply.send(dbDocument._id);
		}
	}
];
