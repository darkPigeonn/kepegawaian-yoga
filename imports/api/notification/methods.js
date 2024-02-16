import { Notifications } from "./notification";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "notification.getAll"(email){
        return Notifications.find({'data.member_email': email},{sort: {createdAt: -1}}).fetch();
    },
    "notification.insert"(data) {
        check(data, Array);

        const dataSave = { 
            data,
            createdAt: new Date(),
        };

        return Notifications.insert(dataSave);
    },
})