import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import DataTable from 'datatables.net-dt';
import "datatables.net-responsive-dt";
import moment from "moment";

Template.App_home.onCreated(function () {
  const self = this;

  setTimeout(() => {
    let table = new DataTable('#example', {
      responsive: true
    });
    
  }, 3000);
});
Template.App_home.helpers({
  bulanPeriode() {
    const currentDate = moment();
    const monthInText = currentDate.format('MMMM');
    const yearInText = currentDate.format('YYYY');
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  }
});