#!/usr/bin/env node
"use strict";

import * as _ from "lodash";
import * as dotenv from "dotenv";

import {Model, Types} from "mongoose";
import Draft from "../../models/draft";
import CollectionsModelsMap from "../../_reactivestack/collections.models.map";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const _hasItemId = (model: Model<any>): boolean => _.includes(_.keys(model.schema.paths), "itemId");

const _validate = (request, reply, done) => {
	// IMPODTANT: do NOT use plain done() without params in POST - it doubles the call for some reason...

	// console.log("_validate user:", request.user.id, request.user.name);
	// TODO: verify permissions
	// if fail use: done(..something..); to break process and return ..something..
	done();
};

module.exports = [
	{
		method: "POST",
		url: "/api/draft/focus/:draftId",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {user, params: {draftId}, body: {field}} = request;
			const userId = user.id;

			const draft = await Draft.findOne({_id: draftId});
			if (!draft) throw new Error(`Draft does not exist: ${draftId}`);

			let meta = _.get(draft, "meta", {});
			if (_.get(meta, field)) return reply.send(false);

			_.each(meta, (val, id) => {
				if (_.get(val, "user", false) === userId) meta = _.omit(meta, id);
			});
			_.set(meta, field, {user: userId});
			await Draft.updateOne({_id: draftId}, {$set: {meta}});

			reply.send(true);
		},
	},

	{
		method: "POST",
		url: "/api/draft/blur/:draftId",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {user, params: {draftId}, body: {field}} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			if (!draft) throw new Error(`Draft does not exist: ${draftId}`);

			const meta = _.get(draft, "meta", null);
			if (meta) {
				const curr = _.get(meta, field);
				if (curr) {
					const focusedBy = _.get(curr, "user");
					if (focusedBy !== userId) return false;
					const metaData = _.omit(meta, field);
					await Draft.updateOne({_id: draftId}, {$set: {meta: metaData}});
				}
			}

			reply.send(true);
		},
	},

	{
		method: "POST",
		url: "/api/draft/change/:draftId",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {user, params: {draftId}, body: {field, value}} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			if (draft) {
				let {document} = draft;
				document = _.set(document, field, value);
				const updater = {
					updatedBy: userId,
					updatedAt: new Date(),
					document
				};
				return reply.send(Draft.updateOne({_id: draftId}, {$set: updater}));
			}
			reply.send({draftId, change: {field, value}, userId, error: "Draft does not exist!"});
		},
	},

	{
		method: "POST",
		url: "/api/draft/cancel/:draftId",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {params: {draftId}} = request;
			await Draft.deleteOne({_id: draftId});
			reply.send(true);
		},
	},

	{
		method: "GET",
		url: "/api/draft/create/:id",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {user, params: {collectionName, sourceDocumentId}} = request;
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
				draft.document = _.omit(document, ["_id", "updatedAt", "updatedBy"]);
				draft.meta = {};
				draft.createdBy = userId;
				existing = await Draft.create(draft);
			}

			reply.send(existing._id);
		},
	},

	{
		method: "POST",
		url: "/api/draft/save/",
		preValidation: _validate,
		handler: async (request, reply) => {
			const {user, params: {draftId}} = request;
			const userId = user.id;

			const draft: any = await Draft.findOne({_id: draftId});
			const {collectionName} = draft;

			const model = CollectionsModelsMap.getModelByCollection(collectionName);
			if (!model) throw new Error(`Model not found for collectionName ${collectionName}`);

			const document = _.omit(draft.document, ["_id", "createdAt"]);

			let max: any = await model
				.find({itemId: document.itemId})
				.sort({iteration: -1})
				.limit(1);
			max = _.first(max);
			await model.updateOne({_id: max._id}, {$set: {isLatest: false}});

			document.isLatest = true;
			document.iteration = max.iteration + 1;
			document.createdBy = userId;
			document.createdAt = new Date();

			await Draft.deleteOne({_id: draftId});
			const dbDocument = await model.create(document);
			reply.send(dbDocument._id);
		},
	}

];
