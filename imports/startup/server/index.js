// Import server startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import "./fixtures.js";
import "./register-api.js";

isEmptyData = function (data) {
    let dataReturn = 0;
    Object.keys(data).forEach(function (key) {
      const value = data[key];
      if (value === "") {
        dataReturn = 1;
      }
    });

    //return 0 : filled, 1 : not filled
    return dataReturn;
  };



  queryPartnerCode = function(){
    const thisUser = Meteor.users.findOne({
      '_id' : Meteor.userId
    })
    console.log(thisUser);
    return thisUser.partnerCode
  }