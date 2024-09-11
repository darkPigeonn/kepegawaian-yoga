import { Notifications } from "./notification";
import { Projects } from "../projects/projects";
import { Tasks } from "../tasks/tasks";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "notification.getAll"(){
        const thisUser = Meteor.userId();
        const users = Meteor.users.findOne({
            _id: thisUser,
        });
        const data = Notifications.find({receiverId: users.profileId},{sort: {
            createdAt: -1
        }}).fetch()
        return data;
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