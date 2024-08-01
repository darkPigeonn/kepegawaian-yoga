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
    self.dataSalaries = new ReactiveVar();
    Meteor.call("payroll.getAll", function (error, result) {
        if (result) {
            self.dataSalaries.set(result)
        }
        else {
            console.log(error);
        }
    });
});

Template.listPayroll.helpers({
    dataSalaries() {
        return Template.instance().dataSalaries.get();
    },
})

Template.listPayroll.events({
    "click #btn-filter"(e, t) {
        const monthYearValue = $("#filterMonthYear").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        month = parseInt(month);
        year = parseInt(year);
        Meteor.call("payroll.getFilter", month, year, function (error, result) {
            if (result) {
                t.dataSalaries.set(result)
            }
            else {
                console.log(error);
            }
        });
    },

    "click #resetFilter"(e, t) {
        e.preventDefault();
        document.getElementById('filterMonthYear').value = '';
        Meteor.call("payroll.getAll", function (error, result) {
            if (result) {
                t.dataSalaries.set(result)
            }
            else {
                console.log(error);
            }
        });
    }
})

Template.detailPayroll.onCreated(function() {
    const self = this;
    self.dataSalarie = new ReactiveVar();
    const id = FlowRouter.getParam("_id");
    Meteor.call("payroll.getDetail", id, function (error, result) {
        if (result) {
            console.log(result);
            self.dataSalarie.set(result)
        }
        else {
            console.log(error);
        }
    });
})

Template.detailPayroll.helpers({
    dataSalarie() {
        return Template.instance().dataSalarie.get();
    },
}) 

Template.createPayroll.onCreated(function() {
    const self = this;
    self.pegawai = new ReactiveVar();
    self.dataRekap = new ReactiveVar();
    self.isEmployeeDisabled = new ReactiveVar();
    self.isMonthDisabled = new ReactiveVar();
    self.dataDetailSlip = new ReactiveVar([]);
    self.btnRekap = new ReactiveVar(false);
    self.total = new ReactiveVar(0);
    self.totalTarifLembur = new ReactiveVar(0);
    self.rateOvertime = new ReactiveVar(0);
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
    },
    btnRekap() {
        return Template.instance().btnRekap.get();
    },
    total() {
        return Template.instance().total.get();
    },
    totalTarifLembur() {
        return Template.instance().totalTarifLembur.get();
    },
    rateOvertime() {
        return Template.instance().rateOvertime.get();
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
                if(error.error == 412) {
                    t.btnRekap.set(true);
                    failAlert(error.reason)
                }
                else {
                    failAlert("Cek kembali rekap absen");
                }
            }
        })
    },

    "keyup #nominal"(e, t) {
        const idInput = $("#nominal").val();
        e.target.value = formatRupiah(idInput, "Rp. ");
    },
    "input #tarifLembur"(e, t) {
        const inputValue = Number(e.target.value);
        t.rateOvertime.set(inputValue)
        const dataRekap = t.dataRekap.get();
        const totalHour = dataRekap.details.totalOvertime
        const totalTarif = totalHour * inputValue
        t.totalTarifLembur.set(totalTarif)
    },
    "click #btn-save-lembur"(e,t){
        e.preventDefault();
        const category = "allowance";
        const name = `Tarif Lembur @Rp`+ formatRupiah(t.rateOvertime.get().toString());
        const amount = t.totalTarifLembur.get();
        const obj = {
            category,
            name,
            amount
        }
        const dataDetailSlip = t.dataDetailSlip.get()
        dataDetailSlip.push(obj);
        t.dataDetailSlip.set(dataDetailSlip);
        let gajiPokok = t.dataRekap.get();
        let tempTotal = gajiPokok.baseSalary;
        for (const iterator of dataDetailSlip) {
            if (iterator.category == "allowance") {
                tempTotal += iterator.amount;
            } else if (iterator.category == "deduction") {
                tempTotal -= iterator.amount;
            }
        }
        t.total.set(tempTotal);
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
        let gajiPokok = t.dataRekap.get();
        let tempTotal = gajiPokok.baseSalary;

        for (const iterator of dataDetailSlip) {
            if (iterator.category == "allowance") {
                tempTotal += iterator.amount;
            } else if (iterator.category == "deduction") {
                tempTotal -= iterator.amount;
            }
        }

        t.total.set(tempTotal);
    },
    "click .btn-remove"(e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        let tempTotal = t.total.get();
        let dataDetailSlip = t.dataDetailSlip.get();
        if(index != undefined) {
            const itemToRemove = dataDetailSlip[index];
            if (itemToRemove.category == "allowance") {
                tempTotal -= itemToRemove.amount;
            } else if (itemToRemove.category == "deduction") {
                tempTotal += itemToRemove.amount;
            }
            dataDetailSlip.splice(index, 1);
        }
        t.dataDetailSlip.set(dataDetailSlip);
        t.total.set(tempTotal);
    },
    "click #btn-save"(e, t) {
        e.preventDefault();
        Swal.fire({
            title: "Warning",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak",
            text: "Apakah anda yakin ingin membuat slip gaji pegawai ini?",
        }).then((result) => {
            if(result.isConfirmed) {
                const dataSave = t.dataDetailSlip.get();
                const dataRekap = t.dataRekap.get();
                const id = $("#inputKaryawan").val();
                const monthYearValue = $("#monthYear").val(); // Dapatkan nilai dari input monthYear
                let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
                month = parseInt(month);
                year = parseInt(year);
                Meteor.call("payroll.createPayroll", dataSave, dataRekap, id, month, year, function (error, result) {
                    if(result) {
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