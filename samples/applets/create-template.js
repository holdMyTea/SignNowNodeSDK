/*
 * to run update document applet from the project root folder type in your console:
 * > node samples/applets/create-template <cliend_id> <client_secret> <username> <password> <path_to_file> <fields_stringified> <template_name> <delete_original>
 * <cliend_id>, <client_secret>, <username>, <password>, <path_to_file>, <fields_stringified>, <template_name> - are required params
 * <delete_original> - optional param. If ommited defaults to false
 */

'use strict';

const [
  clientId,
  clientSecret,
  username,
  password,
  filepath,
  fieldsStringified,
  templateName,
  removeOriginalDocument,
] = process.argv.slice(2);

const api = require('../../lib')({
  credentials: Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
  production: false,
});

const { oauth2: { requestToken: getAccessToken } } = api;
const {
  document: {
    create: uploadDocument,
    update: addFields,
  },
  template: { create: createTemplate },
} = api;

getAccessToken({
  username,
  password,
}, (tokenErr, tokenRes) => {
  if (tokenErr) {
    console.error(tokenErr);
  } else {
    const { access_token: token } = tokenRes;

    uploadDocument({
      filepath,
      token,
    }, (uploadErr, uploadRes) => {
      if (uploadErr) {
        console.error(uploadErr);
      } else {
        const { id } = uploadRes;
        const client_timestamp = Math.floor(Date.now() / 1000);
        let fields;

        try {
          fields = JSON.parse(fieldsStringified);
        } catch (err) {
          console.error(err);
          return;
        }

        addFields({
          fields: {
            client_timestamp,
            fields,
          },
          id,
          token,
        }, updateErr => {
          if (updateErr) {
            console.error(updateErr);
          } else {

            createTemplate({
              document_id: id,
              document_name: templateName,
              options: { removeOriginalDocument: removeOriginalDocument === 'true' },
              token,
            }, (templateErr, templateRes) => {
              if (templateErr) {
                console.error(templateErr);
              } else {
                console.log(templateRes);
              }
            });

          }
        });
      }
    });
  }
});