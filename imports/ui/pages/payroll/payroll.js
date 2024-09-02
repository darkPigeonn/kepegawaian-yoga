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
    self.viewMode = new ReactiveVar(1);
    self.departements = new ReactiveVar();
    self.estimasiPengeluaran = new ReactiveVar(0);
    self.namaDepartemen = new ReactiveVar();
    self.monthPayroll = new ReactiveVar();
    self.yearPayroll = new ReactiveVar();
    Meteor.call("payroll.getDepartments", function (error, result) {
        if (result) {
          self.departements.set(result);
        } else {
          console.log(error);
        }
    });
});

Template.listPayroll.helpers({
    dataSalaries() {
        return Template.instance().dataSalaries.get();
    },
    estimasiPengeluaran() {
        return Template.instance().estimasiPengeluaran.get();
    },
    viewMode() {
        return Template.instance().viewMode.get();
    },
    departements() {
        return Template.instance().departements.get();
    },
    namaDepartemen() {
        return Template.instance().namaDepartemen.get();
    },
    monthPayroll() {
        return Template.instance().monthPayroll.get();
    },
    yearPayroll() {
        return Template.instance().yearPayroll.get();
    }
})

Template.listPayroll.events({
    "click #payrollByDepartment"(e, t) {
        e.preventDefault();
        const param = $(e.target).attr('milik');
        const departmentId = $(e.target).attr('departmentId')
        const month = t.monthPayroll.get();
        const year = t.yearPayroll.get();
        Meteor.call("payroll.getAll", departmentId, month, year, function (error, result) {
            if (result) {
                t.dataSalaries.set(result.dataEmployee)
                t.estimasiPengeluaran.set(result.estimasiPengeluaran);
                t.viewMode.set(2);
                t.namaDepartemen.set(param);
            }
            else {
                console.log(error);
            }
        });
    },
    "click #btn-back"(e, t) {
        e.preventDefault();
        t.viewMode.set(1);
    },
    "click #btn-filter"(e, t) {
        const monthYearValue = $("#filterMonthYear").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        console.log(monthYearValue);
        if(monthYearValue == "") {
            console.log("masuk sini");
            
            month = t.monthPayroll.get();
            year = t.yearPayroll.get();
        }
        else {
            month = parseInt(month);
            year = parseInt(year);
        }

        Meteor.call("payroll.getFilter", month, year, function (error, result) {
            if (result) {
                t.dataSalaries.set(result.dataEmployee)
                t.estimasiPengeluaran.set(result.estimasiPengeluaran);
                t.viewMode.set(2);
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
    },
    "click #btn-publish-monthly"(e, t) {
        const monthYearValue = $("#filterMonthYear").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        month = parseInt(month);
        year = parseInt(year);
        let messageBulan;
        let messageTahun;
        if(Number.isNaN(month)) {
            const currentMoment = moment();
            const month = currentMoment.month() + 1;
            messageBulan = month
        }
        else {
            messageBulan = month
        }
        if(Number.isNaN(year)) {
            const currentMoment = moment();
            const year = currentMoment.year();
            messageTahun = year;
        }
        else {
            messageTahun = year;
        }
        
        Swal.fire({
            title: "Warning",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak",
            text: `Apakah anda yakin ingin melakukan publish slip gaji pegawai bulan ${messageBulan} tahun ${messageTahun}?`,
        }).then((result) => {
            if(result.isConfirmed) {
                Meteor.call("payroll.publishMonthly", month, year, function(error, result) {
                    if(error) {
                        console.log(error);
                        failAlert(error)
                    }
                    else {
                        if(result == undefined) {
                            successAlert("Tidak ada payroll yang di publish")
                        }
                        else {
                            successAlert("Payroll bulanan berhasil dipublish")
                            location.reload()
                        }
                    }
                })
            }
        })
    },
    "click .btn-delete"(e, t) {
        e.preventDefault();
        const id = e.target.getAttribute('milik');
        Swal.fire({
            title: "Konfirmasi Hapus",
            text: "Apakah anda yakin ingin menghapus slip gaji ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                Meteor.call("payroll.delete", id, function(error, result) {
                    if(result) {
                        successAlert("Slip gaji berhasil dihapus")
                        location.reload()
                    }
                    else {
                        console.log(error);
                        failAlert("Slip gaji gagal dihapus")
                    }
                })
            }
        })
    },
    "click #btn-filter-department"(e, t) {
        const monthYearValue = $("#filterMonthYearDepartment").val(); // Dapatkan nilai dari input monthYear
        let [year, month] = monthYearValue.split('-'); // Pisahkan bulan dan tahun
        month = parseInt(month);
        year = parseInt(year);
        Meteor.call("payroll.getDepartments", month, year, function (error, result) {
            if (result) {
              t.departements.set(result);
              t.monthPayroll.set(month); // Months are zero-indexed in JavaScript
              t.yearPayroll.set(year);
              successAlert(`Berhasil mencari data di bulan ${month} tahun ${year}`)
            } else {
              console.log(error);
              failAlert(error);
            }
        });
    },
    "click #resetFilterDepartment"(e, t) {
        e.preventDefault();
        document.getElementById('filterMonthYearDepartment').value = '';
        Meteor.call("payroll.getAll", function (error, result) {
            if (result) {
                t.departements.set(result);
                successAlert("Sukses")
            }
            else {
                console.log(error);
                failAlert(error);
            }
        });
    },
})

Template.detailPayroll.onCreated(function() {
    const self = this;
    self.dataSalarie = new ReactiveVar();
    self.fillReason = new ReactiveVar(false);
    self.request = new ReactiveVar();
    self.buktiTransfer = new ReactiveVar([]);
    const id = FlowRouter.getParam("_id");
    Meteor.call("payroll.getDetail", id, function (error, result) {
        if (result) {
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
    fillReason() {
        return Template.instance().fillReason.get();
    },
    request() {
        return Template.instance().request.get();
    },
    buktiTransfer() {
        return Template.instance().buktiTransfer.get();
    }
}) 

Template.detailPayroll.events({
    "change #buktiTransfer": function (e, t) {
      const buktiTransfer = t.buktiTransfer.get();
      const files = $("#buktiTransfer").prop("files");
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file) {
          const reader = new FileReader();
          const body = {
            file: file,
          };
          reader.addEventListener("load", function () {
            body.src = this.result;
            if (file.type != ".jpg" || file.type != ".png") {
              $(`#buktiTransfer-${buktiTransfer.length - 1}`).attr(
                "href",
                this.result
              );
            }
          });
          reader.readAsDataURL(file);
          buktiTransfer.push(body);
          t.buktiTransfer.set(buktiTransfer);
        }
      }
    },
    "click .remove-buktiTransfer": function (e, t) {
      e.preventDefault();
      const index = $(e.target).attr("milik");
      const buktiTransfer = t.buktiTransfer.get();
      buktiTransfer.splice(parseInt(index), 1);
      t.buktiTransfer.set(buktiTransfer);
    },
    async "click #btn-save"(e, t) {
        e.preventDefault();
        const id = FlowRouter.getParam("_id");
        let data = {};
        Swal.fire({
          title: "Konfirmasi",
          text: "Apakah anda yakin ingin mengunggah slip gaji",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Iya",
          cancelButtonText: "Tidak",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const files = t.buktiTransfer.get();
                const thisForm = {};
                thisForm[files] = [];
                if (files.length > 0) {
                    for (let index = 0; index < files.length; index++) {
                        const fileName = files[index].file.name;
                        const uploadData = {
                        fileName: "kepegawaian/payroll/" + fileName,
                        type: "image/png",
                        Body: files[index].file
                        }
                        const linkUpload = await uploadFiles(uploadData);
                        thisForm[files].push(
                        {
                            name: files[index].file.name,
                            link: linkUpload
                        });
                    }
                    data.links = thisForm[files]
                }
            }
    
            Meteor.call("payroll.uploadBuktiTransfer", data, id, function (error, result) {
                if(result) {
                    Swal.close();
                    successAlert();
                    location.reload();
                    history.back();
                }
                else {
                    Swal.close();
                    console.log(error);
                    failAlert(error);
                }
            })
        });
        
    },
    "click #btn-publish"(e, t) {
        Swal.fire({
            title: "Warning",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak",
            text: "Apakah anda yakin ingin melakukan publish slip gaji pegawai ini?",
        }).then((result) => {
            if(result.isConfirmed) {
                const id = FlowRouter.getParam("_id");
                Meteor.call("payroll.publish", id, function(error, result) {
                    if(result) {
                        successAlert("Slip gaji berhasil di publish")
                        location.reload()
                    }
                    else {
                        console.log(error);
                        failAlert(error)
                    }
                })
            }
        })
    },
    "click #btn-request"(e, t) {
        const request = e.target.getAttribute('milik')
        t.fillReason.set(true);
        t.request.set(request)
    },
    "click #btn-send"(e, t) {
        Swal.fire({
            title: "Konfirmasi Permintaan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ya",
            cancelButtonText: "Tidak",
            text: `Apakah anda yakin ingin melakukan permintaan ${t.request.get()} slip gaji?`,
        }).then((result) => {
            if(result.isConfirmed) {
                const id = FlowRouter.getParam("_id")
                const reason = $("#input-reason").val();
                const data = {
                    id,
                    request: t.request.get(),
                    reason
                }
                
                Meteor.call("payroll.request", data, function(error, result) {
                    if(result) {
                        successAlert("Permintaan berhasil diajukan ke chief")
                        history.back()
                    }
                    else {
                        console.log(error);
                        failAlert("Permintaan gagal diajukan ke chief")
                    }
                })
            }
        })
    }
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
            title: "Konfirmasi",
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
                        successAlert("pembuatan Slip Gaji berhasil")
                        location.reload();
                    }
                    else{
                        if(error.error == 412) {
                            failAlert(error.reason)
                        }
                        else {
                            failAlert("Pembuatan Slip Gaji gagal");
                        }
                    }
                });
            }
        })
    }
})

Template.editPayroll.onCreated(function() {
    const self = this;
    self.dataRekap = new ReactiveVar();
    self.pegawai = new ReactiveVar();
    self.isEmployeeDisabled = new ReactiveVar();
    self.isMonthDisabled = new ReactiveVar();
    self.dataDetailSlip = new ReactiveVar([]);
    self.btnRekap = new ReactiveVar(false);
    self.total = new ReactiveVar(0);
    self.totalTarifLembur = new ReactiveVar(0);
    self.rateOvertime = new ReactiveVar(0);
    const id = FlowRouter.getParam("_id")
    Meteor.call("payroll.loadEdit", id, function (error, result) {
        if(result) {
            const persentaseKehadiran = ((result.details.totalPresensi / result.activeDayWorking)*100).toFixed(2)
            result.persentaseKehadiran = persentaseKehadiran
            self.dataRekap.set(result);
            let tempTotal = 0;
            tempTotal += result.baseSalary
            if(result.detailSlip.length > 0) {
                self.dataDetailSlip.set(result.detailSlip)
                for (const iterator of result.detailSlip) {
                    if (iterator.category == "allowance") {
                        tempTotal += iterator.amount;
                    } else if (iterator.category == "deduction") {
                        tempTotal -= iterator.amount;
                    }
                }
                self.total.set(tempTotal)
            }
        }
        else{
            console.log(error);
            failAlert("Cek kembali rekap absen");
        }
    })
})

Template.editPayroll.helpers({
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

Template.editPayroll.events({
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
            title: "Konfirmasi",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak",
            text: "Apakah anda yakin ingin membuat slip gaji pegawai ini?",
        }).then((result) => {
            if(result.isConfirmed) {
                const dataSave = t.dataDetailSlip.get();
                const dataRekap = t.dataRekap.get();
                const idEmployee = dataRekap.details.userId // employee id
                const idSalaries = FlowRouter.getParam("_id")
                let month = dataRekap.month
                let year = dataRekap.year
                month = parseInt(month);
                year = parseInt(year);
                Meteor.call("payroll.editPayroll", dataSave, dataRekap, idEmployee, month, year, idSalaries, function (error, result) {
                    if(result) {
                        successAlert("Pengubahan Slip Gaji berhasil")
                        history.back();
                    }
                    else{
                        if(error.error == 412) {
                            failAlert(error.reason)
                        }
                        else {
                            failAlert("Pengubahan Slip Gaji gagal");
                        }
                    }
                });
            }
        })
    }
})

Template.requestActionPayroll.onCreated(function() {
    const self = this;
    self.dataRequest = new ReactiveVar();
    Meteor.call("payroll.listRequest", function (error, result) {
        if(result) {
            self.dataRequest.set(result)
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                if(element.status == 60 || element.status == 90) {
                    element.isAction = false
                }
                else if(element.status == undefined || element.status == null) {
                    element.isAction = true
                }
            }
        }
        else {
            console.log(error);
            failAlert("Gagal")
        }
    })
})

Template.requestActionPayroll.helpers({
    dataRequest () {
        return Template.instance().dataRequest.get();
    }
})

Template.requestActionPayroll.events({
    "click .btn-action" (e, t) {
        e.preventDefault();
        const type = e.target.getAttribute("milik")
        let text = "";
        if(type == "accept") text = "menerima"
        if(type == "decline") text = "menolak"
        Swal.fire({
            title: "Konfirmasi",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak",
            text: `Apakah anda yakin ingin ${text} aksi slip gaji ini?`
        }).then((result) => {
            if(result.isConfirmed) {
                const id = e.target.getAttribute("id")
                const data = {
                    id,
                    type
                }
                Meteor.call("payroll.approvalActionRequest", data, function(error, result) {
                    if(result) {
                        successAlert(`Berhasil ${text} permintaan aksi slip gaji`)
                        location.reload()
                    }
                    else {
                        console.log(error);
                        failAlert(`Gagal ${text} permintaan aksi slip gaji`)
                    }
                })
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