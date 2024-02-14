import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AppProfiles, AppUsers } from "../../collections-profiles";
import { Announcements } from './collections-siakad';

export const Slideshows = new Mongo.Collection( 'slideshows', { idGeneration: 'MONGO' } );

Meteor.methods({
    'insertSlideshow': function(data){
      // checkAllowAccess(['cmsArticleCreate'])

      console.log(data);
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      return Slideshows.insert(data)
    },

    'insertAnnouncement': function (data){
      const outlets = Meteor.user().outlets
      data.outlets = outlets
      return Announcements.insert(data)
    },

    'toggleAnnouncement': function (data) {
      return Announcements.update({ _id: data.id },
      {$set: {'status': data.status}}
      )
    },

    'featuredAnnouncement': function (data) {
      const update = Announcements.update({ _id: data.id },
        {$set: {'featured': data.status}}
      )
      return update
    },

    'updateSlideshow':function (data) {
      checkAllowAccess(['cmsArticleEdit'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByCol(Article, { _id })
      const updateQuery = {
        $set: data
      }
      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return Slideshows.update({ _id }, updateQuery);
    },
    'toggleSlideshow': function (data) {
      checkAllowAccess(['cmsArticleDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Article, {'_id': data.id})
      return Slideshows.update({ _id },
      {$set: {'status': data.status}}
      )
    },
    'insertAnnouncementSiakad': async function(data){
      // checkAllowAccess(['cmsArticleCreate'])

      data.outlets = ['imavi','cim']


      const create = Announcements.insert(data)

      const emailMessage = data.content;
      const emailSubject =
          "[IMAVI] Pengumuman";
      if (create) {

        // harus di insert dulu
        const students = AppUsers.find({roles : 'cimStudent', partners : 'imavi'}).fetch();

        for (let index = 0; index < students.length; index++) {
          const element = students[index];

          const dataSend = {
            'email' : element.email,
            emailSubject,
            emailMessage
          }
          if (element.email) {
            await sendNotificationByEmail(dataSend);
          }
        }
      }
       if (create) {
        return true
      }
    },
    'updateAnnouncementSiakad': function(data){
      // checkAllowAccess(['cmsArticleCreate'])
      const id = data.id;
      delete data.id

      return Announcements.update({_id : id}, {$set : data})
      //harus di insert dulu
      // const students = AppUsers.find({roles : 'cimStudent', partners : 'imavi'}).fetch();

      // for (let index = 0; index < students.length; index++) {
      //   const element = students[index];

      //   console.log(element.email);



      // }
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // return Slideshows.insert(data)
    },
    'getAnnouncementsSiakad' : function(){
      const userOutlets = Meteor.user().outlets
      const $in = [];
      if (userOutlets) {
        userOutlets.forEach((element) => {
          $in.push(element);
        });
      }
      return Announcements.find({outlets: {$in}}).fetch();
    },
    'getAnnouncementsSiakadById' : function(id){
      return Announcements.findOne({_id :id});
    }
});