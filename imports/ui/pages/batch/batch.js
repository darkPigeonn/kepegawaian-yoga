import "./batch.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.batch_page.onCreated(function () {
  const self = this;

  self.batchs = new ReactiveVar();

  Meteor.call("batch.getAll", function (error, result) {
    if (result) {
      self.batchs.set(result);
    } else {
      console.log(error);
    }
  });
});
Template.batch_page.helpers({
  batchs() {
    return Template.instance().batchs.get();
  },
});
Template.batch_create.events({
  "click #btn_save"(e, t) {
    e.preventDefault();

    const name = $("#input_name").val();
    const startDate = $("#input_startDate").val();
    const amountBroodStock = $("#input_amountBroodStock").val();

    Meteor.call(
      "batch.insert",
      name,
      startDate,
      amountBroodStock,
      function (error, result) {
        if (result) {
          alert("Sukses");
          location.reload();
        } else {
          alert("Insert batch error");
          console.log(error);
        }
      }
    );
  },
});

Template.batch_detail.onCreated(function () {
  const self = this;

  self.batch = new ReactiveVar();
  self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");

  Meteor.call("batch.getBy", id, function (error, result) {
    if (result) {
      self.batch.set(result);
    } else {
      console.log(error);
    }
  });
});
Template.batch_detail.helpers({
  batch() {
    return Template.instance().batch.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
});
Template.batch_detail.events({
  "click .btn-add-feed"(e, t) {
    e.preventDefault();

    const mode = $(e.target).attr("milik");
    let value = "0";
    if (mode == "1") {
      value = "2";
    } else {
      value = "1";
    }

    t.viewMode.set(value);
  },
  "click #btn_save"(e, t) {
    e.preventDefault();

    const feedDate = $("#input_feedDate").val();
    const feedCategory = $("#input_feedCategory").val();
    const feedAmount = $("#input_feedAmount").val();
    const feedPrices = $("#input_feedPrices").val();

    const id = FlowRouter.getParam("_id");

    Meteor.call(
      "batch.feedInsert",
      id,
      feedDate,
      feedCategory,
      feedAmount,
      feedPrices,
      function (error, result) {
        if (result) {
          location.reload();
        }
      }
    );
  },
});
