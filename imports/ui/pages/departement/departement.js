import "./departement.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2";

Template.departement_page.onCreated(function () {
    const self = this;
  
    self.departements = new ReactiveVar();
  
    Meteor.call("departement.getAll", function (error, result) {
      if (result) {
        // console.log(result);
        self.departements.set(result);
      } else {
        console.log(error);
      }
    });
});

Template.departement_page.helpers({
    departements() {
      return Template.instance().departements.get();
    }
});

Template.departement_create.events({
    "click #btn_save_departement"(e, t) {
        e.preventDefault();
    
        const name = $("#input_departement").val();
        const description = $("#input_description").val();

        if(!name || !description) {
          Swal.fire({
            title: "Gagal",
            text: "Data gagal dimasukkan, pastikan semua kolom terisi",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
          return;
        }

        // console.log(name, description);
        const data = {
            name,
            description
        };
    
        Meteor.call(
          "departement.insert",
          data,
          function (error, result) {
            // console.log(result);
            if (result) {
              // alert("Sukses");
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              // alert("Insert departement error");
              Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              console.log(error);
            }
          }
        );
    },
});

Template.departement_create.helpers({
    departements() {
        return Template.instance().departements.get();
    }
});

Template.departement_edit.onCreated(function () {
    const self = this;
    self.departement = new ReactiveVar();
    const id = FlowRouter.getParam("_id");
    // console.log(id);

    Meteor.call("departement.getBy", id, function (error, result) {
       if(result) {
        // console.log(result);
        self.departement.set(result);
       } else {
        console.log(error);
       }
    })
});

Template.departement_edit.helpers({
    departement(){
        return Template.instance().departement.get();
    }
});

Template.departement_edit.events({
    "click #btn_save_departement"(e, t){
        e.preventDefault();

        const name = $("#input_name").val();
        const description = $("#input_description").val();
        const id = FlowRouter.getParam("_id");  

        if(!name || !description) {
          Swal.fire({
            title: "Gagal",
            text: "Data gagal diupdate, pastikan semua kolom terisi",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
          return;
        }
        // console.log(name, description);
        const data = {
            name,
            description
        };

        // console.log(data);
    
        Meteor.call(
          "departement.update",
          id,
          data,
          function (error, result) {
            console.log(result);
            if (result) {
              // alert("Sukses");
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              // alert("Update departement error");
              Swal.fire({
                title: "Gagal",
                text: "Data gagal diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              console.log(error);
            }
          }
        );
    }
});

Template.departement_detail.onCreated(function () { 
    const self = this;
    self.departement = new ReactiveVar(); 
    const id = FlowRouter.getParam("_id");
    // console.log(id);
    let data;
    const cek = [];

    Meteor.call("departement.getBy", id, function (error, result) {
       if(result) {
        console.log(result);
        self.departement.set(result);
       } else {
        console.log(error);
       }
    });
});

Template.departement_detail.helpers({
    departement(){
        return Template.instance().departement.get();
    },
    employee(){
        return Template.instance().employee.get();
    }
});