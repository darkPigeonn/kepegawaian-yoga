// Methods related to invoices

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

// import { SimpleRest } from 'meteor/simple:rest';
import moment from 'moment';
import _ from 'underscore';


process.env.MAIL_URL = Meteor.settings.MAIL_URL;
process.env.MAILGUN_DOMAIN = Meteor.settings.MAILGUN_DOMAIN;
process.env.MAILGUN_API_KEY = Meteor.settings.MAILGUN_API_KEY;


export const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

export const reportError = async function (errorMessage) {
  const data = {
    "from": "INSTITUT TEOLOGI YOHANES MARIA VIANNEY <noreply@imavi.org>",
    "to": ['notnakusnadi@gmail.com'],
    "subject": 'Error YOGA1',
    "html": errorMessage,
  }
  mailgun.messages().send(data, (error, body) => {
    if (error) {
      //(error);
    } else {
    }
  });
}

export const sendEmail = async function (targetEmail, emailSubject, emailMessage) {
  //(process.env.MAILGUN_API_KEY)
  //(process.env.MAILGUN_DOMAIN)

  const data = {
    "from": "INSTITUT TEOLOGI YOHANES MARIA VIANNEY <noreply@imavi.org>",
    "to": targetEmail,
    "subject": emailSubject,
    "html": emailMessage,
  }
  console.log(data);

  mailgun.messages().send(data, (error, body) => {
    if (error) {
      console.log(error);

    } else {

    }
  });
}

export const coba = function(text) {

  //(text)
  return true;
}