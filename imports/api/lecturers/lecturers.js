import { Mongo } from "meteor/mongo";

export const Lecturers = new Mongo.Collection("lecturers", { idGeneration: 'MONGO' });


Meteor.methods({
    'getLecturers' : function (){
        const currentUser = Meteor.user();

        return Lecturers.find({
            outlets :  {$in: currentUser.outlets}
        }).fetch();
    },
    'insertLecturers': function(data){
    //   checkAllowAccess(['cmsLecturersCreate'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
        const currentUser = Meteor.user();

        data.outlets = currentUser.outlets;
        data.createdBy = Meteor.userId();
        data.createdAt = new Date()
        if (data.selectedPartners){
          data.partners = data.selectedPartners
        }
        delete data.selectedPartners 
        delete data.unselectedPartners
      return Lecturers.insert(data)
    },
    'updateLecturers':function (data) {
    //   checkAllowAccess(['cmsLecturersEdit'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const selectedPartners = data.selectedPartners
      const unselectedPartners = data.unselectedPartners
      const _id = new Meteor.Collection.ObjectID(data._id)
      delete data._id;
      delete data.selectedPartners
      delete data.unselectedPartners
      const updateQuery = {
        $set: data,
        $addToSet: {
          partners: {$each: selectedPartners},
          logUpdate : {
            updateBy : Meteor.userId(),
            updatedByName : Meteor.user().fullname,
            updatedAt : new Date()
        },
      },
      }
      
      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      Lecturers.update({ _id }, updateQuery);
      if (unselectedPartners.length > 0){
        Lecturers.update({ _id },{
          $pull: { partners: { $in: unselectedPartners }}
        });
      }
    },
    'toggleLecturers': function (data) {
      checkAllowAccess(['cmsLecturersDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Lecturers, {'_id': data.id})
      return Lecturers.update({ _id },
      {$set: {'status': data.status}}
      )
    },
    'featuredLecturers': function (data) {
    //   checkAllowAccess(['cmsLecturersFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      const update = Lecturers.update({ _id },
        {$set: {'featured': data.status}}
      )
      return update
    },
    'getLecturersById': function (id) {
        console.log(id);
      const _id = new Meteor.Collection.ObjectID(id)
      return Lecturers.findOne({
        '_id' : _id
      });
    }
});