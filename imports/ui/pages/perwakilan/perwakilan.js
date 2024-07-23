import "./perwakilan.html";

Template.listPerwakilan.onCreated(function () {
  const self = this;

  startPreloader();

  self.listPerwakilan = new ReactiveVar();
  Meteor.call("perwakilan.getAll", function (error, result) {
    if (result) {
      self.listPerwakilan.set(result);
      exitPreloader();
    } else {
      console.log(error);
      exitPreloader();
    }
  });
});
Template.listPerwakilan.helpers({
  listPerwakilan() {
    return Template.instance().listPerwakilan.get();
  },
});
Template.listPerwakilan.events({
  "click #btn-save-form"(e, t) {
    e.preventDefault();

    const name = $("#input-name").val();
    const code = $("#input-code").val();
    Meteor.call("");
  },
});
