import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import DataTable from 'datatables.net-dt';
import "datatables.net-responsive-dt";
import moment from "moment";

Template.App_home.onCreated(function () {
  const self = this;

  self.employees = new ReactiveVar();
  self.employeesKeluar = new ReactiveVar();
  self.employeesMasuk = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  self.totalSuratMasuk = new ReactiveVar();
  self.totalSuratKeluar = new ReactiveVar();
  Meteor.call("surat.getCountAll", function(error, result) {
    if(error) {
      console.log(error);
      failAlert(error)
    }
    else {
      self.totalSuratMasuk.set(result.totalSuratMasuk)
      self.totalSuratKeluar.set(result.totalSuratKeluar)
    }
  })
});
Template.App_home.helpers({
  employees() {
    return Template.instance().employees.get();
  },
  employeesKeluar() {
    return Template.instance().employeesKeluar.get();
  },
  employeesMasuk() {
    return Template.instance().employeesMasuk.get();
  },
  bulanPeriode() {
    const currentDate = moment();
    const monthInText = currentDate.format('MMMM');
    const yearInText = currentDate.format('YYYY');
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  totalSuratMasuk() {
    return Template.instance().totalSuratMasuk.get();
  },
  totalSuratKeluar() {
    return Template.instance().totalSuratKeluar.get();
  }
});