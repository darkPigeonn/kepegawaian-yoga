import { Meteor } from 'meteor/meteor';
import { Categories } from "./categories";
import { check } from "meteor/check";

Meteor.methods({
    getCategories: function () {
        return Categories.find({}).fetch();
    },
    getCategory: function (id) {
        check(id, String);
        const objectID = new Meteor.Collection.ObjectID(id);
        return Categories.findOne({
            _id: objectID,
        });
    },
});