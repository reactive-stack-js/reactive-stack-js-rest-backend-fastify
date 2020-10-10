#!/usr/bin/env node
"use strict";

import * as _ from "lodash";
import {Types} from "mongoose";

const routeFactory = (model, modelName, validator: Function) => (
	[
		{
			method: "POST",
			url: "/api/" + modelName + "/focus/:draftId",
			preValidation: validator,
			handler: async (request, reply) => {
				const response = await _setFocus(model, request);
				reply.send(response);
			},
		},

		{
			method: "POST",
			url: "/api/" + modelName + "/blur/:draftId",
			preValidation: validator,
			handler: async (request, reply) => {
				const response = await _setBlur(model, request);
				reply.send(response);
			},
		},

		{
			method: "POST",
			url: "/api/" + modelName + "/change/:draftId",
			preValidation: validator,
			handler: async (request, reply) => {
				const response = await _setChange(model, request);
				reply.send(response);
			},
		},

		{
			method: "GET",
			url: "/api/" + modelName + "/draft/:id",
			preValidation: validator,
			handler: async (request, reply) => {
				const response = await _createDraft(model, request);
				reply.send(response);
			},
		},

		{
			method: "POST",
			url: "/api/" + modelName + "/cancel/:draftId",
			preValidation: validator,
			handler: async (request, reply) => {
				const response = await _cancelDraft(model, request);
				reply.send(response);
			},
		}
	]
);
export default routeFactory;

const _setFocus = async (model, {user, params: {draftId}, body: {field}}) => {
	const document = await model.findOne({_id: draftId});
	if (document.isDraft) {
		let meta = _.get(document, "meta", {});
		if (_.get(meta, field)) return false;

		_.each(meta, (val, id) => {
			if (_.get(val, "user", false) === user.id) {
				meta = _.omit(meta, id);
			}
		});
		_.set(meta, field, {user: user.id});
		await model.updateOne({_id: draftId}, {$set: {meta}});
		return true;
	}
	return false;
};

const _setBlur = async (model, {user, params: {draftId}, body: {field}}) => {
	const document: any = await model.findOne({_id: draftId});
	if (document.isDraft) {
		const meta = _.get(document, "meta", null);
		if (meta) {
			const curr = _.get(meta, field);
			if (curr) {
				const userId = _.get(curr, "user");
				if (userId !== user.id) return false;
				const metaData = _.omit(meta, field);
				await model.updateOne({_id: draftId}, {$set: {meta: metaData}});
			}
		}
		return true;
	}
	return false;
};

const _setChange = async (model, {user, params: {draftId}, body: {field, value}}) => {
	const document: any = await model.findOne({_id: draftId});
	if (document.isDraft) {
		const updater = {
			updatedBy: user.id,
			updatedAt: new Date()
		};
		_.set(updater, field, value);
		await model.updateOne({_id: draftId}, {$set: updater});

		return true;
	}
	return false;
};

const _createDraft = async (model, {user, params: {id}}) => {
	const document: any = await model.findOne({_id: id});
	let existing: any = _.first(await model.find({itemId: document.itemId, isDraft: true}));
	if (!existing) {
		const draft: any = _.omit(document, ["meta", "updatedAt", "updatedBy"]);
		draft._id = Types.ObjectId();
		draft.isDraft = true;
		draft.isLatest = false;
		draft.createdAt = new Date();
		draft.createdBy = user.id;
		existing = await model.create(draft);
	}
	return existing._id;
};

const _cancelDraft = async (model, {user, params: {draftId}}) => {
	const document: any = await model.findOne({_id: draftId});
	if (document.isDraft) {
		await model.remove({_id: draftId});
		return true;
	}
	return false;
};
