import "./card.html";

Template.cardMobileWelcome.onCreated(function () { 
    const self = this;
    self.myData = new ReactiveVar({});
   

    Meteor.call("dosen.getMine", function (error, result) {
      if (result) {
        console.log(result);
        self.myData.set(result);
        console.log(result)
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
        console.log(result);
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
