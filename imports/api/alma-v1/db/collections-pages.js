import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Page = new Mongo.Collection("pages", { idGeneration: "MONGO" });

Meteor.methods({
    'insertPage': function(data){
      checkAllowAccess(['cmsPageCreate'])
      // checkOutletByInput(data.outlets)
      Page.insert(data)
    },
    'updatePage':function (data) {
      checkAllowAccess(['cmsPageEdit'])
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Meteor.users, {
      //   '_id' : data.id
      // })
      Page.update({'_id': new Meteor.Collection.ObjectID(data.id)}, {$set:data});
    },
    'togglePage': function (data) {
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Meteor.users, {
      //   '_id' : data.id
      // })
      checkAllowAccess(['cmsPageDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id);
        Page.update({'_id': _id},
        {$set: {'status': data.status}}
        )
    }
});