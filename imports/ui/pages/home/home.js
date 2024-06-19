import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import "../../components/chart/chart.js";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import moment from "moment";
import {
  EmployeeGolongan,
  EmployeeStatus,
} from "../../../api/employee/employee.js";
import { dataListInput } from "../../../api/user/user.js";

Template.App_home.onCreated(function () {
  isLoading(true);
  const self = this;

  self.employees = new ReactiveVar();
  self.employeesKeluar = new ReactiveVar();
  self.employeesMasuk = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  const userId = Meteor.userId();
  const handles = [Meteor.subscribe("user.me", function () {})];
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
    const monthInText = currentDate.format("MMMM");
    const yearInText = currentDate.format("YYYY");
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
});
Template.home_admin.onCreated(function () {
  isLoading(true);
  const self = this;
  self.dashboardData = new ReactiveVar();
  startPreloader();
  setTimeout(() => {
    let table = new DataTable("#example", {
      responsive: true,
    });
    isLoading(false);
  }, 1000);
  isLoading(false);

  Meteor.call("getDashboardData", function (error, result) {
    if (error) {
      console.log(error);
      exitPreloader();
    } else {
      self.dashboardData.set(result);

      exitPreloader();
    }
  });
});
Template.home_admin.helpers({
  dashboardData() {
    return Template.instance().dashboardData.get();
  },
  today() {
    return new Date();
  },
});
Template.home_admin_school.onCreated(function () {
  isLoading(true);
  const self = this;

  self.items = new ReactiveVar();
  self.totalItems = new ReactiveVar();
  const userId = Meteor.userId();

  self.summaryStatus = new ReactiveVar();

  setTimeout(() => {
    let table = new DataTable("#example", {
      responsive: true,
    });
    isLoading(false);
  }, 1000);
  Meteor.call("ppdb-school-getAll", (error, result) => {
    if (error) {
      console.error("Error while fetching students:", error);
      exitPreloader();
    } else {
      self.items.set(result.registrans);
      self.totalItems.set(result.totalRegistrans);
      exitPreloader();
    }
  });
  isLoading(false);
});
Template.home_admin_school.helpers({
  items() {
    return Template.instance().items.get();
  },
  totalRegistrans() {
    const template = Template.instance();
    if (template.items.get().length > 0) {
      const allRegistrans = template.items.get();
      const totalRegistrans = allRegistrans.length;
      const totalWaiting = allRegistrans.filter(
        (item) => item.status >= 10 && item.status < 60
      ).length;
      const totalAccepted = allRegistrans.filter(
        (item) => item.status == 60
      ).length;
      console.log(totalRegistrans, totalWaiting, totalAccepted);
      return { totalRegistrans, totalWaiting, totalAccepted };
    }
  },

  today() {
    return new Date();
  },
});
