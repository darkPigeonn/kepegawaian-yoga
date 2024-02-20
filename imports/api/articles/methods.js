import { Article } from "./article";
// import { Notifications } from "../notification/notification";
// import { check } from "meteor/check";
// import { Roles } from "meteor/alanning:roles";
// import moment from "moment";
import { Partner } from '../administrasi/administrasi';


Meteor.methods({
    'insertArticle': function(data){
      const isAdmin = checkAdmin();

      if (isAdmin) {
        return Article.insert(data)
      }
    },

    "article-delete": function (param) {
      return Article.remove({
        _id: new Meteor.Collection.ObjectID(param),
      });
    },

    'articles-migratePartners': function (){
      const problemList = []
      const searchData = {
        partners: { $exists: false },
      };
      const articles = Article.find(searchData).fetch()
      for (const article of articles) {
        const firstOutlet = article.outlets.find(element => element !== "general" && element !== "parokiAll" )
        const partners = Partner.findOne({code: firstOutlet })

        if (partners){
          const $set = {
            partners: partners.code,
            
          }
          if (partners.hostName){
            $set.originalUrl = partners.hostName + "/articles/" + article.slug
          } else {
            problemList.push("Warning "+ article.title + " hostName tidak diupdate karena hostName partner belum diisi ("+partners.code+") \n")
          }
          Article.update({_id: article._id},{$set})           
        } else {
          problemList.push(article.title+" tidak diupdate karena partner tidak ditemukan (" + firstOutlet +") \n")
        }
      }
      return problemList
    },

    'articles-migrateHostName': function (){
      const problemList = []
      const searchData = {
        partners: { $exists: true },
      };
      const articles = Article.find(searchData).fetch()
      for (const article of articles) {
        if (article.partners){
          const partners = Partner.findOne({code: article.partners })
          if (partners){
            if (partners.hostName){
              const $set = {
                originalUrl: partners.hostName + "/articles/" + article.slug
              }
              Article.update({_id: article._id},{$set})
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
    'updateArticle':function (data) {
      checkAllowAccess(['cmsArticleEdit'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const _id = new Meteor.Collection.ObjectID(data.id)
      delete data.id
      const updateQuery = {
        $set: data
      }

      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return Article.update({ _id }, updateQuery);
    },
    'toggleArticle': function (data) {
      checkAllowAccess(['cmsArticleDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Article, {'_id': data.id})
      return Article.update({ _id },
      {$set: {'status': data.status}}
      )
    },
    'featuredArticle': function (data) {
      checkAllowAccess(['cmsArticleFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      const update = Article.update({ _id },
        {$set: {'featured': data.status}}
      )
      return update;
    },
    'getArticleById': function (id) {
      const _id = new Meteor.Collection.ObjectID(id)
      return Article.findOne({
        '_id' : _id
      });
    },
    "getArticles": function (userOutlets) {
      const $in = [];
      if (userOutlets) {
        userOutlets.forEach((element) => {
          $in.push(element);
        });
      }
      return Article.find({
        outlets: { $in },
      },{sort: {publishDate: -1} }).fetch();
    },
    "article-details": function (param) {
      const detail = Article.findOne({
        _id: new Meteor.Collection.ObjectID(param),
      });
      return detail;
    },
});