import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import DataTable from 'datatables.net-dt';
import "datatables.net-responsive-dt";
import moment from "moment";

Template.App_home.onCreated(function () {
  const self = this;

  self.courses = new ReactiveVar();

  Meteor.call("myActiveCourses.getAll", function(error, result){
    if(result){
      console.log(result);
      self.courses.set(result)
    }else{
      console.log(error);
    }
  })


});
Template.App_home.helpers({

  courses() {
    return Template.instance().courses.get();
  }
});