// Import server startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import "./fixtures.js";
import "./register-api.js";

isEmptyData = function (data) {
    let dataReturn = 0;
    Object.keys(data).forEach(function (key) {
      const value = data[key];
      if (value === "") {
        dataReturn = 1;
      }
    });

    //return 0 : filled, 1 : not filled
    return dataReturn;
  };



  queryPartnerCode = function(){
    const thisUser = Meteor.users.findOne({
      '_id' : Meteor.userId
    })
    console.log(thisUser);
    return thisUser.partnerCode
  }

sendNotifications = function(data){
  const newDataSave = {
    id_project: idProject,
    data: dataNotif,
    assign_for: notifType,
    senderId: adminPartner._id,
    receiverId: "system",
    message: messages,
    categoryId: 10,
    categoryName: "Informasi",
    timestamp: new Date(),
    createdAt: new Date(),
    createdBy: adminPartner._id
  };
}
Meteor.publish('userData', function () {
  // Publikasikan data pengguna saat ini
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId });
  } else {
    return this.ready(); // Jika tidak ada userId, kirimkan data kosong
  }
});