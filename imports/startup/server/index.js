// Import server startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import "./fixtures.js";
import "./register-api.js";
import { Schools } from '../../api/yoga/schools/schools.js';

isEmptyData = function (data) {
    let dataReturn = 0;
    Object.keys(data).forEach(function (key) {
      const value = data[key];
      if (value === "") {
        dataReturn = 1;
      }
    });

    //return 0 : filled, 1 : not filled
    return dataReturn;
  };



  queryPartnerCode = function(){
    const thisUser = Meteor.users.findOne({
      '_id' : Meteor.userId
    })
    console.log(thisUser);
    return thisUser.partnerCode
  }

  export const formatRupiah = function (angka, prefix) {
    var number_string = angka.replace(/[^,\d]/g, "").toString(),
      split = number_string.split(","),
      sisa = split[0].length % 3,
      rupiah = split[0].substr(0, sisa),
      ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
      separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
    console.log(rupiah);
    return rupiah;
  };


  getAccess = async function(thisUser) {
    let accessList = {}
    if(thisUser.schoolId) {
      const thisSchool = await Schools.findOne({ _id: thisUser.schoolId });
      if (thisSchool) {
        if(thisSchool.unitCode != '02') {
          accessList.isCooperation = true
        }else{
          accessList.isCooperation = false
        }

      }

    }

    return accessList

  }