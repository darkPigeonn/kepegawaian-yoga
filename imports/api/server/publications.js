import {
    Meteor
} from 'meteor/meteor';
import {
    Roles
} from 'meteor/alanning:roles';

import moment from 'moment';
import _ from 'underscore';

Meteor.publish("userSearch", function(value) {
    // console.log(this.userId);
    console.log(value);
    if(value){
        return Meteor.users.find({ _id: value }, {
            fields: {
              "_id": 1,
              "emails": 1,
              "fullname": 1,
              "roles": 1,
              "outlets": 1,
              'partners' : 1,
              "username" : 1
            }
        });
    }
    
});