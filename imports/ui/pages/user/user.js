import "./user.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { result, template } from "underscore";
import { HTTP } from 'meteor/http';

Template.listUser.onCreated(function () { 
    const self = this;
    self.dataListUser = new ReactiveVar();

    Meteor.call("users.getAll", function (error, result) {
        if (result) {
          console.log(result);
          self.dataListUser.set(result);
        } else {
          console.log(error);
        }
    });
});

Template.listUser.helpers({
    dataListUser(){
        return Template.instance().dataListUser.get();
    }
})

Template.createUser.events({
    "click #btn_save_user"(e, t){
        console.log("masuk");
        const username = $("#input_username").val();
        const password = $("#input_password").val();
        const role = $("#input_roles").val();
        const fullname = $("#input_fullname").val();

        const dataSend = {
            username,
            password,
            fullname,
            role
        };

        Meteor.call("users.createAppMeteor", dataSend, function (error ,result) { 
            if (result) {
                // alert("Sukses");
                Swal.fire({
                  title: "Berhasil",
                  text: "Data berhasil dimasukkan",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                }).then((result) => {
                  if(result.isConfirmed) {
                    location.reload();
                  }
                });
                // location.reload();
              } else {
                Swal.fire({
                  title: "Gagal",
                  text: "Data gagal dimasukkan, cek kembali data yang dimasukkan",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
                // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
                console.log(error);
              }
        })
    }
})