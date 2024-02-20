import { Prayers, PrayersGroup } from "./prayers";
import { Notifications } from "../notification/notification";
import { check } from "meteor/check";
import moment from "moment";
import slugify from 'slugify';
// import { ObjectId } from 'mongodb';

Meteor.methods({
    'prayersGroup-delete' : function (_id){
        PrayersGroup.remove({_id})
      },
      'insertPrayersGroup': function(data){
        const prayers = data.prayers
        data.createdAt = new Date()
        data.createdBy = Meteor.userId()
        data.status = true
        data.timeline = []
        const prayersGroup = PrayersGroup.insert(data)
        prayers.forEach(element => {
          Prayers.update({_id: element._id}, {$set: {prayersGroupId: prayersGroup.insertedId}})
        });
        return "Berhasil Membuat Grup doa !"
      },
      'updatePrayersGroup' : function (data){
        const _id = data.id
        delete data.id
        const timeline = {
          type: "update",
          updatedBy: Meteor.userId(),
          updatedAt: new Date()
        }
        return PrayersGroup.update({_id}, {$set: data, $push: {timeline}})
      },
      'insertPrayer': function(data){
        data.category = 'prayer'
        return Prayers.insert(data)
      },
      'uploadPrayer' : async function (data) {
        check(data, Array);
  
        let checkSuccess = 0;
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
  
          //cek title untuk slug
          const title = element.title;
          const slug = slugify(title, {
            lower:true,
            strict: true,
          })
  
          const outlets = ['keuskupanSby','imavi'];
  
          const dataSave = {
            'title' : title,
            'slug' : slug,
            'author' : '-',
            'excerpt' : element.excerpt,
            'content' : element.content,
            'category': 'prayer',
            'outlets' : outlets,
            'publishDate' : new Date(),
            'createdAt' : new Date(),
            'createdBy' : Meteor.userId(),
            'status' : true,
            'referensi' : element.sumber,
            'status' : true,
          }
  
          const insert  = await Prayers.insert(dataSave);
  
          if (insert) {
            checkSuccess += 1;
          }
        }
  
        if (checkSuccess == data.length) {
          return true
        } else {
          throw new Meteor.Error(402, 'Data Gagal diuploads');
        }
      },
      'updatePrayer':function (data) {
  
        // karena ada input outlet dari form maka perlu dicek juga
        // checkOutletByInput(data.outlets)
        // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
        // outlet yang diinput sebelumnya?
        const _id = new Meteor.Collection.ObjectID(data.id)
        delete data.id
        // checkOutletByCol(Prayer, { _id })
        data.category = 'prayer'
        const updateQuery = {
          $set: data
        }
        if(data.imageLink !== ''){
          updateQuery.$unset = {
            fireImageLink: ''
          }
        }
        return Prayers.update({ _id }, updateQuery);
      },
      'togglePrayer': function (data) {
        checkAllowAccess(['cmsPrayerDelete'])
        const _id = new Meteor.Collection.ObjectID(data.id)
        // checkOutletByInput(data.outlets)
        // checkOutletByCol(Prayer, {'_id': data.id})
        return Prayers.update({ _id },
        {$set: {'status': data.status}}
        )
      },
      'featuredPrayer': function (data) {
        console.log(data);
        const _id = new Meteor.Collection.ObjectID(data.id)
        const update = Prayers.update({ _id },
          {$set: {'featured': data.status}}
        )
        return update
      },
      'featuredPrayersGroup': function (data) {
        const update = PrayersGroup.update({ _id: data.id },
          {$set: {'featured': data.status}}
        )
        return update
      },
      'getPrayerById': function (id) {
        const _id = new Meteor.Collection.ObjectID(id)
        return Prayers.findOne({
          '_id' : _id
        });
      },
      'getPrayers': function(){
        return Prayers.find().fetch();
      },
      'getPrayersGroups': function(userOutlets){
        const $in = [];
        if (userOutlets) {
          userOutlets.forEach((element) => {
            $in.push(element);
          });
        }
        return PrayersGroup.find({
          outlets: { $in },
        }).fetch();      
      },
      'getPrayersGroupById': function(_id){
        return PrayersGroup.findOne({_id});
      }
});