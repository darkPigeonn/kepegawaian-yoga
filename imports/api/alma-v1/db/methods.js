import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import moment from "moment";
import { Partner } from "../../administrasi/administrasi";
import { Roles } from "meteor/alanning:roles";
import { Outlet } from "./collections-outlet.js";
import { Article } from "../../articles/article.js";
import { Chronicles } from "../../administrasi/administrasi.js";
import { Jubileum, OrganizationDocuments } from "../../keuskupan/keuskupan.js";
import { Homilies } from "../../homilies/homilies.js";
import { News } from "../../news/news.js";
import { Webinar } from "../../webinar/webinar.js";
import { Events } from "../../events/events.js";
import { Slideshows } from "../../alma-v1/db/collections-slideshow.js";
import { Prayers } from "../../prayers/prayers.js";
import { Songs } from "../../alma-v1/db/collections-songs.js";

import {
  AssetChronicles,
  AssetDocumentOptions,
  AssetDocuments,
  FixedAssets,
  Tarekats,
  UnitKaryas,
  Vehicles,
  DocumentPublishers,
  AssetDocumentRequests,
} from "../../assets/assets.js";

Meteor.methods({
  summaryDashboard() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const articles = Article.find({
      outlets: { $in: thisUser.outlets },
    }).fetch().length;
    const news = News.find({ outlets: { $in: thisUser.outlets } }).fetch()
      .length;

    return { totalArticle: articles, totalNews: news };
  },
  repairDate(page) {
    const userId = Meteor.users.findOne({ _id: this.userId });
    if (!userId) {
      throw new Meteor.Error(403, "Forbidden");
    }
    check(page, String);

    const date = new Date("1970-01-01T00:00:00.000Z");

    // console.log(page);
    if (page == "fixedAssets") {
      const assets = FixedAssets.find({}).fetch();
      for (let index = 0; index < assets.length; index++) {
        const x = assets[index];
        if (x.datePurchase.toString() == date.toString()) {
          FixedAssets.update(
            { _id: x._id },
            {
              $set: {
                datePurchase: null,
              },
            }
          );
        }

        const documentAssets = AssetDocuments.find({ assetId: x._id }).fetch();
        for (let index = 0; index < documentAssets.length; index++) {
          const y = documentAssets[index];
          if (y.datePublish.toString() == date.toString()) {
            AssetDocuments.update(
              { _id: y._id },
              {
                $set: {
                  datePublish: null,
                },
              }
            );
          }

          if (y.dateExpiry && y.dateExpiry.toString() == date.toString()) {
            AssetDocuments.update(
              { _id: y._id },
              {
                $set: {
                  dateExpiry: null,
                },
              }
            );
          }
        }
      }
    } else if (page == "chronicle") {
      const chronicle = Chronicles.find({}).fetch();
      for (let index = 0; index < chronicle.length; index++) {
        const x = chronicle[index];
        if (x.startDate.toString() == date.toString()) {
          Chronicles.update(
            { _id: x._id },
            {
              $set: {
                startDate: null,
              },
            }
          );
        }

        if (x.endDate.toString() == date.toString()) {
          Chronicles.update(
            { _id: x._id },
            {
              $set: {
                endDate: null,
              },
            }
          );
        }
      }
    } else if (page == "organizationDocument") {
      const organizationDocument = OrganizationDocuments.find({}).fetch();
      for (let index = 0; index < organizationDocument.length; index++) {
        const x = organizationDocument[index];
        if (x.dateExpired.toString() == date.toString()) {
          OrganizationDocuments.update(
            { _id: x._id },
            {
              $set: {
                dateExpired: null,
              },
            }
          );
        }
      }
    } else if (page == "article") {
      const article = Article.find({}).fetch();
      for (let index = 0; index < article.length; index++) {
        const x = article[index];
        // console.log(x);
        // if (x.publishDate.toString() == date.toString()) {
        //   Article.update({ _id: x._id }, {
        //     $set: {
        //       publishDate: null
        //     }
        //   });
        // }
      }
    } else if (page == "homilies") {
      const homiliesList = Homilies.find({}).fetch();
      for (let index = 0; index < homiliesList.length; index++) {
        const x = homiliesList[index];
        // if (x.publishDate.toString() == date.toString()) {
        //   Article.update({ _id: x._id }, {
        //     $set: {
        //       publishDate: null
        //     }
        //   });
        // }
      }
    } else if (page == "news") {
      const listNews = News.find({}).fetch();
      for (let index = 0; index < listNews.length; index++) {
        const x = listNews[index];
        if (x.publishDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          News.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                publishDate: null,
              },
            }
          );
        }
      }
    } else if (page == "webinar") {
      const webinarList = Webinar.find({}).fetch();
      for (let index = 0; index < webinarList.length; index++) {
        const x = webinarList[index];
        if (x.webinarDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          Webinar.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                webinarDate: null,
              },
            }
          );
        }
      }
    } else if (page == "event") {
      const eventList = Events.find({}).fetch();
      for (let index = 0; index < eventList.length; index++) {
        const x = eventList[index];
        const id = x._id.toHexString();
        if (x.date.toString() == date.toString()) {
          Events.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                date: null,
              },
            }
          );
        }

        if (x.endDate.toString() == date.toString()) {
          Events.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                endDate: null,
              },
            }
          );
        }
      }
    } else if (page == "slideshow") {
      const slideList = Slideshows.find({}).fetch();
      for (let index = 0; index < slideList.length; index++) {
        const x = slideList[index];
        if (x.publishDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          Slideshows.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                publishDate: null,
              },
            }
          );
        }
      }
    } else if (page == "jubileum") {
      const jubeliumList = Jubileum.find({}).fetch();
      for (let index = 0; index < jubeliumList.length; index++) {
        const x = jubeliumList[index];
        if (x.publishDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          Jubileum.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                publishDate: null,
              },
            }
          );
        }
      }
    } else if (page == "doa") {
      const doaList = Prayers.find({}).fetch();
      for (let index = 0; index < doaList.length; index++) {
        const x = doaList[index];
        if (x.publishDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          Prayers.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                publishDate: null,
              },
            }
          );
        }
      }
    } else if (page == "lagu") {
      const laguList = Songs.find({}).fetch();
      for (let index = 0; index < laguList.length; index++) {
        const x = laguList[index];
        if (x.publishDate.toString() == date.toString()) {
          const id = x._id.toHexString();
          Songs.update(
            { _id: new Meteor.Collection.ObjectID(id) },
            {
              $set: {
                publishDate: null,
              },
            }
          );
        }
      }
    }
  },
});
