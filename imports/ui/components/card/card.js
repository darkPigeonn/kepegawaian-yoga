import "./card.html";

Template.cardMobileWelcome.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   

    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        self.myData.set(result);
      } else {
        console.log(error);
      }
    });
});

Template.cardMobileWelcome.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.cardHomeProfileDetail.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   

    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        self.myData.set(result);
        console.log(result)
      } else {
        console.log(error);
      }
    });
});

Template.cardHomeProfileDetail.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.cardDetailProfileDosen.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   

    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        self.myData.set(result);
        console.log(result)
      } else {
        console.log(error);
      }
    });
});

Template.cardDetailProfileDosen.helpers({
    myData(){
        return Template.instance().myData.get();
    },
});

Template.cardDetailProfileDosen.events({
  'click .image-fit' (e, t){
    e.preventDefault();
    window.open(e.target.src, '_blank');
  }
})
