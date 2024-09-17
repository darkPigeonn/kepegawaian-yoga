import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import moment from "moment";

Template.App_home.onCreated(function () {
  const self = this;

  self.summary = new ReactiveVar();

  Meteor.call("summaryDashboard", function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);

      self.summary.set(res);
    }
  });
});
Template.App_home.helpers({
  summaryDashboard() {
    return Template.instance().summary.get();
  },
  bulanPeriode() {
    const currentDate = moment();
    const monthInText = currentDate.format("MMMM");
    const yearInText = currentDate.format("YYYY");
    const monthYear = monthInText + " " + yearInText;
    return monthYear;
  },
});
