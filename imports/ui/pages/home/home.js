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
  Meteor.call("employee.getAll", function (error, result) {
    if (result) {
      self.employees.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call("employee.getEmployeeKeluar", function (error, result) {
    if (result) {
      self.employeesKeluar.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call("employee.getEmployeeMasuk", function (error, result) {
    if (result) {
      self.employeesMasuk.set(result);
    } else {
      console.log(error);
    }
  });
  setTimeout(() => {
    let table = new DataTable('#example', {
      responsive: true
    });
    
  }, 3000);
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
  }
});