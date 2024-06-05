import { Perwakilan, Schools } from "./schools";

Meteor.methods({
  "schools.getAll"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    return Schools.find().fetch();
  },

  // Perwakilan
  "perwakilan.getAll"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    return Perwakilan.find().fetch();
  },
});
