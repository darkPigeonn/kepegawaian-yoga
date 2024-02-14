import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
// import moment from "moment";
import SimpleSchema from 'simpl-schema';
// import { check } from 'meteor/check';

// import { PeriodeStudis } from './collections.js';
// import { tDict } from './dict-assessment.js';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);
export const Outlet = new Mongo.Collection( 'outlets' );

Meteor.methods({
    'insertOutlet': function(data){
      // const loggedInUser = Meteor.user();

      checkAllowAccess(['cmsOutletCreate'])
      Outlet.insert(data)
      // } else {
        // throw new Meteor.Error(403, "Transcript exists!")
    },
    'updateOutlet': function (data) {
      checkAllowAccess(['cmsOutletEdit'])
      Outlet.update({'_id': data.id},
        {$set: {'name': data.name, 'code': data.code, 'details': data.details}}
        )
    },
    'toggleOutlet': function (data) {
      checkAllowAccess(['cmsOutletDelete'])
        Outlet.update({'_id': data.id},
        {$set: {'status': data.status}}
        )
    },
    "getAllOutlets": function () {
      return Outlet.find({}).fetch();
    },

});
