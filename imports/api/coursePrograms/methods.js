import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { generalPics, documentPics, documentFiles, profilePics } from './collections-files.js';
import { Roles } from 'meteor/alanning:roles';
import { HTTP } from 'meteor/http';
import _ from 'underscore';

import { CoursePrograms } from './coursePrograms.js';


process.env.NETLIFY_HOOKURL = Meteor.settings.NETLIFY_HOOKURL;
process.env.NETLIFY_HOOKURL_CIM = Meteor.settings.NETLIFY_HOOKURL_CIM;
process.env.NETLIFY_HOOKURL_CIM_MY = Meteor.settings.NETLIFY_HOOKURL_CIM_MY;
process.env.APP_ID = Meteor.settings.APP_ID;
process.env.APP_SECRET = Meteor.settings.APP_SECRET;

Meteor.methods({
    "coursesCreate": function(){
        console.log(disini)
    }
})