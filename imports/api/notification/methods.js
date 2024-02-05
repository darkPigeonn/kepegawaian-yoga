import { Notifications } from "./notification";
import { Projects } from "../projects/projects";
import { Tasks } from "../tasks/tasks";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "notification.getAll"(){
      return Notifications.find({},{sort: {createdAt: -1}}).fetch();
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