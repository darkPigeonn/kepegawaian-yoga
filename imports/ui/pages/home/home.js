import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import "../../components/card/card";
import "../../components/tables/tables";
import "../../components/image/image.js";
import DataTable from 'datatables.net-dt';
import "datatables.net-responsive-dt";
import moment from "moment";

Template.App_home.onCreated(function () {
  const self = this;

  self.employees = new ReactiveVar();

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
  bulanPeriode() {
    const currentDate = moment();
    const monthInText = currentDate.format('MMMM');
    const yearInText = currentDate.format('YYYY');
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  }
});