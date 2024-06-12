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

  setTimeout(() => {
    let table = new DataTable("#example", {
      responsive: true,
    });
    isLoading(false);
  }, 1000);
  isLoading(false);
});
Template.home_admin.helpers({
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
  listItemStatus() {
    return [
      { label: "Pegawai Tetap Yayasan (PTY)", amount: 10 },
      { label: "Pegawai Tetap Perwakilan (PTP)", amount: 10 },
      { label: "Pegawai Tidak Tetap (PTT)", amount: 10 },
      { label: "Resign", amount: 10 },
      { label: "Pensiun", amount: 10 },
      { label: "Salah Unit Kerja", amount: 10 },
    ];
  },
  summaryStatus() {
    return Template.instance().summaryStatus.get();
  },
  summaryGolongan() {
    let temp = EmployeeGolongan;
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const groupTemp = [
        {
          code: "I",
          label: "Juru",
        },
        {
          code: "II",
          label: "Pengatur",
        },
        {
          code: "III",
          label: "Penata",
        },
        {
          code: "IV",
          label: "Pembina",
        },
      ];
      temp.forEach((item) => {
        const findItems = listEmployees.filter((employee) => {
          return employee.pekerjaan.gol === item.code;
        });
        item.total = findItems.length;
      });
      groupTemp.forEach((item) => {
        const findItem = temp.filter((employee) => {
          return employee.label.split("/")[0] === item.code;
        });
        item.items = findItem;
      });
      console.log("group", groupTemp);

      return groupTemp;
    }
    return [];
  },
  summaryReligion() {
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const religion = listEmployees.reduce((acc, obj) => {
        const key = obj.religion;
        if (!acc[key]) {
          acc[key] = { label: key, total: 0 };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(religion);
    }
    return [];
  },
  summaryGender() {
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const religion = listEmployees.reduce((acc, obj) => {
        const key = obj.gender.toLowerCase();
        if (!acc[key]) {
          acc[key] = { label: key, total: 0 };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(religion);
    }
    return [];
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  today() {
    return new Date();
  },
});
Template.home_admin_school.onCreated(function () {
  isLoading(true);
  const self = this;

  self.employees = new ReactiveVar();
  self.employeesKeluar = new ReactiveVar();
  self.employeesMasuk = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  const userId = Meteor.userId();

  self.summaryStatus = new ReactiveVar();

  setTimeout(() => {
    let table = new DataTable("#example", {
      responsive: true,
    });
    isLoading(false);
  }, 1000);
  isLoading(false);
});
Template.home_admin_school.helpers({
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
  listItemStatus() {
    return [
      { label: "Pegawai Tetap Yayasan (PTY)", amount: 10 },
      { label: "Pegawai Tetap Perwakilan (PTP)", amount: 10 },
      { label: "Pegawai Tidak Tetap (PTT)", amount: 10 },
      { label: "Resign", amount: 10 },
      { label: "Pensiun", amount: 10 },
      { label: "Salah Unit Kerja", amount: 10 },
    ];
  },
  summaryStatus() {
    return Template.instance().summaryStatus.get();
  },
  summaryGolongan() {
    let temp = EmployeeGolongan;
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const groupTemp = [
        {
          code: "I",
          label: "Juru",
        },
        {
          code: "II",
          label: "Pengatur",
        },
        {
          code: "III",
          label: "Penata",
        },
        {
          code: "IV",
          label: "Pembina",
        },
      ];
      temp.forEach((item) => {
        const findItems = listEmployees.filter((employee) => {
          return employee.pekerjaan.gol === item.code;
        });
        item.total = findItems.length;
      });
      groupTemp.forEach((item) => {
        const findItem = temp.filter((employee) => {
          return employee.label.split("/")[0] === item.code;
        });
        item.items = findItem;
      });
      console.log("group", groupTemp);

      return groupTemp;
    }
    return [];
  },
  summaryReligion() {
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const religion = listEmployees.reduce((acc, obj) => {
        const key = obj.religion;
        if (!acc[key]) {
          acc[key] = { label: key, total: 0 };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(religion);
    }
    return [];
  },
  summaryGender() {
    const listEmployees = Template.instance().employees.get();

    if (listEmployees) {
      const religion = listEmployees.reduce((acc, obj) => {
        const key = obj.gender.toLowerCase();
        if (!acc[key]) {
          acc[key] = { label: key, total: 0 };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(religion);
    }
    return [];
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  today() {
    return new Date();
  },
});
