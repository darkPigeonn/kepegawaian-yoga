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

  self.lecturers = new ReactiveVar();
  const tempDosen = [
    {
      name: 'Budi',
      email: 'Budi@gmail.com',
      dateOfBirth: '01/01/2000',
      gender: 'Male',
    },
    {
      name: 'Adi',
      email: 'Adi@gmail.com',
      dateOfBirth: '02/02/2000',
      gender: 'Male',
    }
  ];
  self.lecturers.set(tempDosen);
  // console.log(self.lecturers.get());

  setTimeout(() => {
    let table = new DataTable('#myTable', {
      responsive: true
    });
    
  }, 500);
});
Template.App_home.helpers({
  lecturers() {
    return Template.instance().lecturers.get();
  },
  bulanPeriode() {
    const currentDate = moment();
    const monthInText = currentDate.format('MMMM');
    const yearInText = currentDate.format('YYYY');
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  }
});