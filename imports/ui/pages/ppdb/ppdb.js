import Swal from "sweetalert2";
import "./ppdb.html";
import { startSelect2 } from "../../../startup/client";
import Papa from "papaparse";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import XLSX from "xlsx";
import moment from "moment";

Template.pagePpdb.onCreated(function () {
  const self = this;
  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 10; // Jumlah data per halaman
  self.students = new ReactiveVar([]);
  self.totalStudents = new ReactiveVar(0);
  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;

    Meteor.call("ppdb-school-getAll", currentPage, perPage, (error, result) => {
      if (error) {
        console.error("Error while fetching students:", error);
        exitPreloader();
      } else {
        self.students.set(result.registrans);
        self.totalStudents.set(result.totalRegistrans);
        exitPreloader();
      }
    });
  });
});
Template.pagePpdb.helpers({
  students: function () {
    console.log(Template.instance().students.get());
    console.log(Template.instance().totalStudents.get());
    return Template.instance().students.get();
  },
  totalPages: function () {
    const totalStudents = Template.instance().totalStudents.get();
    const perPage = Template.instance().perPage;
    return Math.ceil(totalStudents / perPage);
  },
  getPageNumbers: function (totalPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.perPage;
    return (currentPage - 1) * perPage + index + 1;
  },
});
Template.pagePpdb.events({
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
});

// <-- virtual account -->
Template.pageGenerateVa.onCreated(function () {
  const self = this;

  self.items = new ReactiveVar();
  self.schools = new ReactiveVar();
  self.listVa = new ReactiveVar();

  //pagination client
  this.currentPage = new ReactiveVar(1);
  this.pageSize = new ReactiveVar(20);

  Meteor.call("perwakilan.getAll", function (error, result) {
    if (error) {
      console.log("Error fetching items(p):", error);
    } else {
      self.items.set(result.items);
    }
  });

  self.listPeriode = new ReactiveVar();

  Meteor.call("periode-ppdb-getAll", function (error, result) {
    if (error) {
      console.log("fetch error:", error);
    } else {
      console.log(result);
      self.listPeriode.set(result);
    }
  });
});
Template.pageGenerateVa.onRendered(function () {
  const templateInstance = this;
  this.$("#select-school[disabled]").tooltip({
    title: "Silahkan pilih perwakilan terlebih dahulu",
    placement: "top",
    trigger: "hover",
  });
  this.$("#btn-generate[disabled]").tooltip({
    title: "Silahkan pilih perwakilan terlebih dahulu",
    placement: "top",
    trigger: "hover",
  });
  this.autorun(() => {
    const items = Template.instance().items.get();

    if (items && items.length > 0) {
      templateInstance.$("#select-perwakilan").select2({
        placeholder: "Silahkan Pilih Perwakilan",
        allowClear: true,
        minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
        data: items.map((item) => ({
          id: item._id,
          text: item.name,
        })),
      });
      templateInstance.$("#select-perwakilan").select2({});
    }
  });
});
Template.pageGenerateVa.helpers({
  listPerwakilan() {
    return Template.instance().items.get();
  },
  listSchools() {
    return Template.instance().schools.get();
  },
  listVa() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const startIndex = (currentPage - 1) * pageSize;
    return instance.listVa.get().slice(startIndex, startIndex + pageSize);
  },
  currentPage() {
    return Template.instance().currentPage.get();
  },
  totalPages() {
    const instance = Template.instance();
    const pageSize = instance.pageSize.get();
    return Math.ceil(instance.listVa.get().length / pageSize);
  },
  isFirstPage() {
    return Template.instance().currentPage.get() === 1;
  },
  isLastPage() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const totalPages = Math.ceil(instance.listVa.get().length / pageSize);
    return currentPage === totalPages;
  },
  pageNumbers() {
    const instance = Template.instance();
    const totalPages = Math.ceil(
      instance.listVa.get().length / instance.pageSize.get()
    );
    return Array.from({ length: totalPages }, (v, k) => k + 1);
  },
  prevDisabled() {
    return Template.instance().currentPage.get() === 1 ? "disabled" : "";
  },
  nextDisabled() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const totalPages = Math.ceil(data.length / pageSize);
    return currentPage === totalPages ? "disabled" : "";
  },
  isCurrentPage(page) {
    const currentPage = Template.instance().currentPage.get();
    return page === currentPage ? "selected" : "";
  },
  getPageNumbers: function (totalPages) {
    if (totalPages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.pageSize.get();
    return (currentPage - 1) * perPage + index + 1;
  },
  listPeriode() {
    return Template.instance().listPeriode.get();
  },
});

Template.pageGenerateVa.events({
  "change #select-perwakilan"(e, t) {
    e.preventDefault();
    startPreloader();
    const templateInstance = t;

    t.autorun(() => {
      Meteor.call(
        "schools.getByPerwakilan",
        e.target.value,
        function (error, result) {
          if (error) {
            failAlert(error);
          } else {
            $("#select-school").prop("disabled", false);
            if (result && result.length > 0) {
              templateInstance.$("#select-school").select2({
                placeholder: "Silahkan Pilih Sekolah",
                allowClear: true,
                minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
              });
              t.schools.set(result);
              exitPreloaderLoading();
            }
          }
        }
      );
    });
  },
  "change #select-school"(e, t) {
    e.preventDefault();

    $("#btn-generate").prop("disabled", false);
  },
  "click #btn-generate"(e, t) {
    e.preventDefault();
    startPreloader();
    const selectedPerwakilans = $("#select-perwakilan").val();
    const selectedSchools = $("#select-school").val();
    const inputKodePeriode = $("#selectedPeriode").val();
    const selectedTag = $("#select-tag").val();
    if (!selectedTag || selectedTag == "0" || selectedTag == "null") {
      failAlert("Silahkan pilih tag");
      return false;
    }
    Meteor.call(
      "va-generate-va",
      selectedPerwakilans,
      selectedSchools,
      inputKodePeriode,
      selectedTag,
      function (error, result) {
        if (error) {
          console.log("Error fetching", error);
          exitPreloader();
        } else {
          t.listVa.set(result);
          exitPreloader();
        }
      }
    );
  },
  "click #btn-save"(e, t) {
    e.preventDefault();

    startPreloader();

    const listVa = t.listVa.get();

    Meteor.call("va-insert", listVa, function (error, result) {
      if (error) {
        failAlert("Gagal", error);
        exitPreloader();
      } else {
        successAlert("Berhasil");
        location.reload();
      }
    });
  },
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
});

Template.paymentPage.onCreated(function () {
  const self = this;

  self.items = new ReactiveVar();
});
Template.paymentPage.helpers({
  listPaymentVa() {
    return Template.instance().items.get();
  },
});
Template.paymentPage.events({
  "change #upload-csv"(e, t) {
    e.preventDefault();
    startPreloader();
    const file = e.target.files[0];
    //pakai yoga dulu ya
    const reader = new FileReader();
    let dataJson = [];
    console.log(file);

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0]; // Ambil nama sheet pertama
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      for (let index = 1; index < jsonData.length; index++) {
        const element = jsonData[index];
        const dateTemp = new Date(element[6]);
        dateTemp.setDate(dateTemp.getDate() + 1);
        const dateFormatted = dateTemp.toISOString().split("T")[0];

        if (element.length > 0) {
          const newData = {
            compCode: element[0],
            numberCustomer: element[2],
            va: element[0].toString() + element[2].toString(),
            name: element[3],
            amount: element[5],
            date: dateFormatted,
            time: element[7],
            note: element[9],
          };
          dataJson.push(newData);
        }
      }
      t.items.set(dataJson);
    };
    reader.readAsArrayBuffer(file);

    exitPreloader();
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
    startPreloader();

    const items = t.items.get();

    Meteor.call("konfirmasi-payment-upload", items, function (error, result) {
      if (error) {
        failAlert("Gagal");
        exitPreloader();
      } else {
        successAlert("Berhasil");
        exitPreloader();
        // setTimeout(() => {
        //   location.reload();
        // }, 500);
      }
    });
  },
});

Template.detailRegistran.onCreated(function () {
  const self = this;
  startPreloader();
  self.detail = new ReactiveVar();
  const id = FlowRouter.current().params._id;
  Meteor.call("ppdb-registran-detail", id, function (error, result) {
    if (error) {
      console.log("Error fetch data");
      exitPreloader();
    } else {
      self.detail.set(result);
      console.log(result);
      exitPreloader();
    }
  });
});
Template.detailRegistran.helpers({
  registran() {
    return Template.instance().detail.get();
  },
});

Template.pageVa.onCreated(function () {
  const self = this;
  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 30; // Jumlah data per halaman
  self.items = new ReactiveVar([]);
  self.totalItems = new ReactiveVar(0);
  self.formUnduh = new ReactiveVar(false);
  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;

    Meteor.call("va-school-getAll", currentPage, perPage, (error, result) => {
      if (error) {
        console.error("Error while fetching students:", error);
        exitPreloader();
      } else {
        console.log(result);
        self.items.set(result.items);
        self.totalItems.set(result.totalItems);
        exitPreloader();
      }
    });
  });
});
Template.pageVa.helpers({
  formUnduh() {
    return Template.instance().formUnduh.get();
  },
  va: function () {
    return Template.instance().items.get();
  },
  totalPages: function () {
    const totalStudents = Template.instance().totalItems.get();
    const perPage = Template.instance().perPage;
    return Math.ceil(totalStudents / perPage);
  },
  getPageNumbers: function (totalPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.perPage;
    return (currentPage - 1) * perPage + index + 1;
  },
});
Template.pageVa.events({
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
  "click #btn-open-form-download"(e, t) {
    e.preventDefault();

    t.formUnduh.set(!t.formUnduh.get());
  },
  "click #btn-download"(e, t) {
    e.preventDefault();
    startPreloader();
    const unitId = $("#select-perwakilan").val();
    const schoolId = $("#select-school").val();
    const tag = $("#select-tag").val();

    if (!unitId || unitId === "0") {
      swalinfo("Silahkan Pilih Perwakilan");
      exitPreloader();
      return false;
    }
    if (!schoolId || schoolId === "0") {
      swalinfo("Silahkan Pilih Sekolah");
      exitPreloader();
      return false;
    }
    if (!tag || tag === "0") {
      swalinfo("Silahkan Pilih Tag");
      exitPreloader();
      return false;
    }

    Meteor.call("export-va", unitId, schoolId, tag, function (error, result) {
      if (error) {
        console.log("Fetch data gagal :", error);
        exitPreloader();
      } else {
        const fileNameExcel = "Dafta VA.xlsx";
        successAlert("Berhasil");
        exitPreloader();
        return XLSX.writeFile(result, fileNameExcel);
      }
    });
  },
});
