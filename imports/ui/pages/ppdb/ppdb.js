import Swal from "sweetalert2";
import "./ppdb.html";
import { startSelect2 } from "../../../startup/client";
import Papa from "papaparse";
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

    Meteor.call(
      "va-generate-va",
      selectedPerwakilans,
      selectedSchools,
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
        window.reload();
      }
    });
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

    Papa.parse(e.target.files[0], {
      header: true,
      dynamicTyping: true,
      worker: true,
      complete(results, file) {
        if (results.data.length > 0) {
          t.items.set(results.data);
          $("#btn-save").prop("disabled", false);
        } else {
          $("#btn-save").prop("disabled", true);
        }
      },
    });

    exitPreloader();
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
  },
});
