import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles';
import { HTTP } from 'meteor/http';
import _ from 'underscore';

import { Evaluation, EvaluationAnswer } from './evaluations.js';


process.env.NETLIFY_HOOKURL = Meteor.settings.NETLIFY_HOOKURL;
process.env.NETLIFY_HOOKURL_CIM = Meteor.settings.NETLIFY_HOOKURL_CIM;
process.env.NETLIFY_HOOKURL_CIM_MY = Meteor.settings.NETLIFY_HOOKURL_CIM_MY;
process.env.APP_ID = Meteor.settings.APP_ID;
process.env.APP_SECRET = Meteor.settings.APP_SECRET;

Meteor.methods({
    'getEvaluationList' : function(_id){
        return Evaluation.findOne({
          evaluateItemId: _id
        })
    }, 
    'evaluations-insert': function(data){
      // const loggedInUser = Meteor.user();
      // if (!loggedInUser ||
      //     !Roles.userIsInRole(loggedInUser,
      //                         ['admin', 'superadmin'])) {
      //   throw new Meteor.Error(403, "Access denied")
      // }
        // checkAllowAccess(['cmsGeneralCreate'])
        // checkOutletByInput(data.outlets)
        return Evaluation.insert(data)
      // } else {
        // throw new Meteor.Error(403, "Transcript exists!")
    },
    'evaluations-update' : async function (data) {
      return Evaluation.update(
        {
          'evaluateItemId': data.id
        },
        {
          $set:
          {
            'title': data.title, 
            'description': data.description, 
            'questions': data.questions
          }
        }
      );
    },
})