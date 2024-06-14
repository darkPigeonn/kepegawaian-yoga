import { Schools, Units } from "./schools";
import { check } from "meteor/check";
Meteor.methods({
  "schools.getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const skip = (pageNum - 1) * perPage;

    return {
      items: Schools.find(
        {},
        {
          sort: {
            numberOfUnit: 1,
          },
          limit: perPage,
          skip,
        }
      ).fetch(),
      totalItems: Schools.find().count(),
    };
  },
  "schools.getByPerwakilan"(idPerwakilan) {
    check(idPerwakilan, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const id = idPerwakilan;
    return Schools.find({ unitId: id }, { sort: { name: 1 } }).fetch();
  },

  // Perwakilan
  "perwakilan.getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      items: Units.find(
        {
          status: true,
        },
        {
          sort: {
            numberOfUnit: 1,
          },
          limit: perPage,
          skip,
        }
      ).fetch(),
      totalItems: Units.find().count(),
    };
  },
});
