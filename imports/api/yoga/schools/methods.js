import { Schools, Units } from "./schools";
import { check } from "meteor/check";
Meteor.methods({
  "school.getBy"(id) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    console.log(Schools.findOne({ _id: id }));

    return Schools.findOne({ _id: id });
  },
  "schools.getAll"(pageNum, perPage, query) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const skip = (pageNum - 1) * perPage;

    return {
      items: Schools.find(
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          sort: {
            numberOfUnit: 1,
          },
          limit: perPage,
          skip,
        }
      ).fetch(),
      totalItems: Schools.find( {
        name: {
          $regex: query,
          $options: "i",
        },
      }).count(),
    };
  },
  "schools.getAllForm"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }


    return Schools.find().fetch()
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
