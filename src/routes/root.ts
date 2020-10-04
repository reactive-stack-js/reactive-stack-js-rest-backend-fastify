#!/usr/bin/env node
'use strict';

module.exports = {
	method: 'GET',
	url: '/',
	preValidation: async (request, reply, done) => {
		console.log('get / user', request.user);
		done();	// use done(..something..); to break process and return ..something..
	},
	handler: async (request, reply) => {
		reply.send({lorems: 'api'});
	},
};
