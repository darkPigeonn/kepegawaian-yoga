import "./card.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.cardMobileWelcome.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   
    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        self.myData.set(result);
      } else {
        console.log(error);
      }
    });
});

Template.cardMobileWelcome.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.cardHomeProfileDetail.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   
    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        self.myData.set(result);
      } else {
        console.log(error);
      }
    });
});

Template.cardHomeProfileDetail.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.cardDetailProfileDosen.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
    self.formPage = new ReactiveVar(1);
    const _id = FlowRouter.getParam("_id");
    if (_id) {
      Meteor.call("dosen.getDetails", _id,  function (error, result) {
        if (result) {
          console.log("hasil",result);
          self.myData.set(result);
        } else {
          console.log(error);
        }
      });
    }
    else{
      failAlert("Data Dosen Tidak Ditemukan!");
      history.back();
    }
});

Template.cardDetailProfileDosen.helpers({
    myData(){
        return Template.instance().myData.get();
    },
    formPage(){
      return Template.instance().formPage.get()
    }
});

Template.cardDetailProfileDosen.events({
  'click .image-fit' (e, t){
    e.preventDefault();
    window.open(e.target.src, '_blank');
  },
  'click .btnNavigation' (e,t){
    e.preventDefault()
   t.formPage.set($(e.target).data("value"))
  }
})
