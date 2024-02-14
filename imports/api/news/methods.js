import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { News } from "./news";
import { Meteor } from 'meteor/meteor';
import { Partner } from '../administrasi/administrasi';
// import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

Meteor.methods({
    'news-migratePartners': function (data){
      const problemList = []
      const searchData = {
        partners: { $exists: false },
      };
      const articles = News.find(searchData).fetch()
      for (const article of articles) {
        const firstOutlet = article.outlets.find(element => element !== "general" && element !== "parokiAll" )
        const partners = Partner.findOne({code: firstOutlet })

        if (partners){
          const $set = {
            partners: partners.code,
            
          }
          if (partners.hostName){
            $set.originalUrl = partners.hostName + "/news/" + article.slug
          } else {
            problemList.push("Warning "+ article.title + " hostName tidak diupdate karena hostName partner belum diisi ("+partners.code+") \n")
          }
          News.update({_id: article._id},{$set})           
        } else {
          problemList.push(article.title+" tidak diupdate karena partner tidak ditemukan (" + firstOutlet +") \n")
        }
      }
      return problemList
    },
    'news-migrateHostName': function (data){
      const problemList = []
      const searchData = {
        partners: { $exists: true },
      };
      const articles = News.find(searchData).fetch()
      for (const article of articles) {
        if (article.partners){
          const partners = Partner.findOne({code: article.partners })
          if (partners){
            if (partners.hostName){
              const $set = {
                originalUrl: partners.hostName + "/news/" + article.slug
              }
              News.update({_id: article._id},{$set})
            } else {
              problemList.push(article.title+" tidak diupdate karena hostName partner belum diisi (" + article.partners +") \n")
            }
          }else {
            problemList.push(article.title+" tidak diupdate karena partner tidak ditemukan (" + article.partners +") \n")
          }
         
        } 
      }
      return problemList
    },
    'insertNews': function(data){
      checkAllowAccess(['cmsNewsCreate'])
      // checkOutletByInput(data.outlets)
      return News.insert(data)
    },
    'updateNews': async function (data) {
      checkAllowAccess(['cmsNewsEdit'])
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      const _id = new Meteor.Collection.ObjectID(data.id)
      delete data.id
      // checkOutletByCol(News, { _id })
      const updateQuery = {
        $set: data
      }
      
      return News.update({ _id }, updateQuery);
    },
    'toggleNews': function (data) {
      checkAllowAccess(['cmsNewsDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      return News.update({ _id },
        {$set: {'status': data.status}}
      )
    },
    'featuredNews': function (data) {
      checkAllowAccess(['cmsNewsFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      News.update({ _id },
        {$set: {'featured': data.status}}
      )
    },
    getNews: function (userOutlets) {
      const loggedInUser = Meteor.user();
      const $in = [];
      if (Roles.userIsInRole(loggedInUser, ["cmsCurator"])) {
        return News.find().fetch();
      }
      if (userOutlets) {
        userOutlets.forEach((element) => {
          $in.push(element);
        });
      }
      return News.find({
        outlets: { $in },
      }, {sort: {publishDate: -1} }).fetch();
    },
    getNewsFiltered: function (userOutlets) {
      const $in = [userOutlets];
      return News.find({
        outlets: { $in },
        status: true,
      }).fetch();
    },
    getNewsCuration: function (userOutlets) {
      const $in = userOutlets;
      const searchData = {
        status: true,
        curationStatus: { $exists: true },
      };
      // console.log(userOutlets);
      // console.log(searchData);
      if (userOutlets !== "0") {
        searchData.outlets = { $in };
      }
      // console.log(searchData);
      // console.log(News.find(searchData).fetch());
      return News.find(searchData).fetch();
    },
    curateNews: async function (data) {
      const loggedInUser = Meteor.user();
      const _id = data._id;
      let updateQuery;
      if (data.status == true) {
        if (checkAllowAccess(['cmsNewsEdit'])) {
          if (!data.curationStatus) {
            updateQuery = {
              $set: {
                curationStatus: 10,
              },
            };
          }
          else {
            return "Berita sudah pernah diajukan Kurasi";
          }
        } 
      }
      else{
        if (checkAllowAccess(['cmsCurator'])) {
          if (data.curationStatus === 10 && data.status === "tolak") {
            updateQuery = {
              $set: {
                declineReason: data.declineReason,
                status: data.status,
                curationStatus: 99,
                curatorName: loggedInUser.fullname,
                curatorId: loggedInUser._id,
                curatedAt: new Date(),
              },
            };
          } 
          else if (data.curationStatus === 10 && data.status === "terima") {
            updateQuery = {
              $set: {
                outlets: data.outlets,
                status: data.status,
                curationStatus: 20,
                curatorName: loggedInUser.fullname,
                curatorId: loggedInUser._id,
                curatedAt: new Date(),
              },
            };
          }
        }
      }
      console.log(updateQuery);
      return News.update({ _id }, updateQuery);
    },
    "news-details": function (param) {
      const detail = News.findOne({
        _id: new Meteor.Collection.ObjectID(param),
      });
      return detail;
    },
    "news-delete": function (param, userOutlets) {
      const temp = News.remove({
        _id: new Meteor.Collection.ObjectID(param),
      });
      const $in = [];
      if (userOutlets) {
        userOutlets.forEach((element) => {
          $in.push(element);
        });
      }
      return News.find({
        outlets: { $in },
      }).fetch();
    },
  
});