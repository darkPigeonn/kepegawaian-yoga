import "./payroll.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.listPayroll.onCreated(function() {
    const self = this;
    self.data = new ReactiveVar();
});

Template.createPayroll.onCreated(function() {
    const self = this;
    self.pegawai = new ReactiveVar();
    self.dataRekap = new ReactiveVar();
    self.isEmployeeDisabled = new ReactiveVar();
    self.isMonthDisabled = new ReactiveVar();
    self.dataDetailSlip = new ReactiveVar([]);
    startSelect2();
    Meteor.call("employee.getAll", function (error, result) {
        if (result) {
            self.pegawai.set(result)
        }
        else {
            console.log(error);
        }
    });
    return;
})

Template.createPayroll.helpers({
    pegawai() {
        return Template.instance().pegawai.get();
    },
    dataRekap() {
        return Template.instance().dataRekap.get();
    },
    dataDetailSlip() {
        return Template.instance().dataDetailSlip.get();
    },
    isEmployeeDisabled() {
        return Template.instance().isEmployeeDisabled.get();
    },
    isMonthDisabled() {
        return Template.instance().isMonthDisabled.get();
    }
})

Template.createPayroll.events({
    "click #btn-process"(e, t) {
        const id = $("#inputKaryawan").val();
        const monthYearValue = $("#monthYear").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        month = parseInt(month);
        year = parseInt(year);
        Meteor.call("payroll.cekValiditas", id, month, year, function (error, result) {
            if(result) {
                const persentaseKehadiran = ((result.details.totalPresensi / result.activeDayWorking)*100).toFixed(2)
                result.persentaseKehadiran = persentaseKehadiran
                t.dataRekap.set(result);
                t.isEmployeeDisabled.set("disabled");
                t.isMonthDisabled.set("disabled");
            }
            else{
                alert("Cek kembali rekap absen");
            }
        })
    },

    "keyup #nominal"(e, t) {
        const idInput = $("#nominal").val();
        e.target.value = formatRupiah(idInput, "Rp. ");
      },

    "click #btn-tambah-detail"(e, t) {
        const dataDetailSlip = t.dataDetailSlip.get()
        const category = $("#kategori").val();
        const name = $("#keterangan").val();
        let amount = convert2number($("#nominal").val());
        const obj = {
            category,
            name,
            amount
        }
        dataDetailSlip.push(obj);
        t.dataDetailSlip.set(dataDetailSlip);
        console.log(t.dataDetailSlip.get());
    },
    "click .btn-remove"(e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        console.log(index);
        let dataDetailSlip = t.dataDetailSlip.get();
        if(index != undefined) {
            dataDetailSlip.splice(index, 1);
        }
        t.dataDetailSlip.set(dataDetailSlip);
    },
    "click #btn-save"(e, t) {
        e.preventDefault();
        const dataSave = t.dataDetailSlip.get();
        const id = $("#inputKaryawan").val();
        const monthYearValue = $("#monthYear").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        month = parseInt(month);
        year = parseInt(year);
        Meteor.call("payroll.createPayroll", dataSave, id, month, year, function (error, result) {
            if(result) {
                console.log(result);
                alert("pembuatan Slip Gaji berhasil")
                location.reload();
            }
            else{
                if(error.error == 412) {
                    alert(error.reason)
                }
                else {
                    alert("Pembuatan Slip Gaji gagal");
                }
            }
        });
    }
})


function formatRupiah(angka, prefix) {
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
}

function convert2number(data) {
    let temp = data.replace(/\./g, ''); // merubah . jadi ""
    return parseFloat(temp);
}