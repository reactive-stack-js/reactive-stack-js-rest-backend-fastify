#!/usr/bin/env node
"use strict";

import axios from "axios";

import authenticate from "../../util/_f.authenticate";

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

let _fbAppAccessToken;
const _appAccessToken = async () => {
	if (!_fbAppAccessToken) {
		const fburl = `https://graph.facebook.com/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&grant_type=client_credentials`;
		const response = await axios.get(fburl);
		_fbAppAccessToken = response.data.access_token;
	}
	return _fbAppAccessToken;
};

const _userAccessToken = async (code, redirectUri) => {
	const fburl = `https://graph.facebook.com/v5.0/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&redirect_uri=${redirectUri}&code=${code}`;
	const response = await axios.get(fburl);

	const data = response.data;
	if (!!data && !!data.access_token) return data;
	return null;
};

const _providerId = async (accessToken) => {
	const fburl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${_fbAppAccessToken}`;
	const response = await axios.get(fburl);
	return response.data.data;
};

const _userData = async (id, accessToken) => {
	const fburl = `https://graph.facebook.com/${id}?fields=email,name,picture,friends&access_token=${accessToken}`;
	const response = await axios.get(fburl);
	const {data} = response;

	return {
		provider: "facebook",
		providerId: data.id,
		name: data.name,
		email: data.email,
		picture: data.picture.data.url
	};
};

module.exports = {
	method: "POST",
	url: "/auth/facebook",
	handler: async (request, reply) => {
		await _appAccessToken();
		const {code, redirect_uri} = request.body;

		const {access_token} = await _userAccessToken(code, redirect_uri);
		if (access_token) {
			const providerIdData = await _providerId(access_token);
			const {user_id} = providerIdData;
			const facebookUser = await _userData(user_id, access_token);

			const user = await authenticate(facebookUser);
			const jwt = await reply.jwtSign(user);
			return reply.send({jwt, user});
		}

		reply.send({error: "auch"});
	},
};
