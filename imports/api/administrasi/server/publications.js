import { Divisions } from "../administrasi";

Meteor.publish("getDivisionsSuscribe", function () {
  return Divisions.find();
});
