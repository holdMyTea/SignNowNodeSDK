#!/usr/bin/env node

/**
 * to run routing-details applet from the project root folder type in your console:
 * > node bin/routing-details <client_id> <client_secret> <username> <password> <template_id>
 * <client_id>, <client_secret>, <username>, <password>, <template_id> - are required params
 * options:
 * --dev - request will be sent to developer sandbox API
 */

'use strict';

const args = process.argv.slice(2);
const flags = args.filter(arg => /^--/.test(arg));
const params = args.filter(arg => !/^--/.test(arg));

const [
  clientId,
  clientSecret,
  username,
  password,
  templateId,
] = params;

const dev = flags.includes('--dev');

const { promisify } = require('../utils');
const api = require('../lib')({
  credentials: Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
  production: !dev,
});

const {
  oauth2: { requestToken: getAccessToken },
  template: { getRoutingDetails },
} = api;

const getAccessToken$ = promisify(getAccessToken);
const getRoutingDetails$ = promisify(getRoutingDetails);

getAccessToken$({
  username,
  password,
})
  .then(({ access_token: token }) => getRoutingDetails$({
    id: templateId,
    token,
  }))
  .then(res => console.log(res))
  .catch(err => console.error(err));
