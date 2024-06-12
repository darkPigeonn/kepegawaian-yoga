import { formatRupiah } from "../../../startup/client";
import "./forms.html";

Template.formAddPaymentSchool.onCreated(function () {
  const self = this;

  self.total = new ReactiveVar(0);
});
Template.formAddPaymentSchool.helpers({
  total() {
    return Template.instance().total.get();
  },
});
Template.formAddPaymentSchool.events({
  "keyup #inputWajib"(e, t) {
    e.preventDefault();
    e.target.value = formatRupiah(e.target.value, "Rp. ");
  },
});
