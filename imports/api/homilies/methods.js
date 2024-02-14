import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { Homilies } from './homilies.js';
import { Roles } from 'meteor/alanning:roles';
import { HTTP } from 'meteor/http';
import _ from 'underscore';

import { CoursePrograms } from './homilies.js';


process.env.NETLIFY_HOOKURL = Meteor.settings.NETLIFY_HOOKURL;
process.env.NETLIFY_HOOKURL_CIM = Meteor.settings.NETLIFY_HOOKURL_CIM;
process.env.NETLIFY_HOOKURL_CIM_MY = Meteor.settings.NETLIFY_HOOKURL_CIM_MY;
process.env.APP_ID = Meteor.settings.APP_ID;
process.env.APP_SECRET = Meteor.settings.APP_SECRET;

Meteor.methods({
    'homilies-details' : function (param){
        const detail = Homilies.findOne({
          '_id': new Meteor.Collection.ObjectID(param)
        });
        return detail
    },
    'homilies-insert': function(data){
        checkAllowAccess(['cmsArticleCreate'])
        // karena ada input outlet dari form maka perlu dicek juga
        // checkOutletByInput(data.outlets)
        console.log(data)
        return Homilies.insert(data)
    },
    'homilies-update':function (data) {
        checkAllowAccess(['cmsArticleEdit'])
        const _id = new Meteor.Collection.ObjectID(data.id)
        delete data.id
        const updateQuery = {
            $set: data
        }
        return Homilies.update({ _id }, updateQuery);
    },
    'homilies-getAll': function(){
        return Homilies.find().fetch();
    }
})