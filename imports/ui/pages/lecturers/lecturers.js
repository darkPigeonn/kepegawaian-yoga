import "./lecturers.html";
import "../../components/card/card";
import "../../components/tables/tables";
import "../../components/forms/forms";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.lecturers_add.onCreated(function (){

});

Template.lecturers_add.events({
    'click .hover-icon' (e, t) {
        history.back();
    }
});

Template.lecturers_edit.events({
    'click .hover-icon' (e, t) {
        history.back();
    }
});

Template.lecturers_detail.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   
    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        // console.log(result);
        self.myData.set(result);
      } else {
        console.log(error);
      }
    });
});

Template.lecturers_detail.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.lecturers_detail.events({
    'click .hover-icon' (e, t) {
        history.back();
    }
});