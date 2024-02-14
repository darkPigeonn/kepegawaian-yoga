import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Partner } from '../../administrasi/administrasi';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

export const News = new Mongo.Collection( 'news', { idGeneration: 'MONGO' } );
process.env.CDN_URL = Meteor.settings.CDN_URL
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
    }
});