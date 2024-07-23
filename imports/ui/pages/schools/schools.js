import "./schools.html";

Template.listSchools.onCreated(function () {
  const self = this;
  self.listSchools = new ReactiveVar();

  Meteor.call("schools.getAll", function (error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(result);
      self.listSchools.set(result);
    }
  });
});
Template.listSchools.helpers({
  listSchools() {
    return Template.instance().listSchools.get();
  },
});
