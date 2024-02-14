import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';

import { Roles } from "meteor/alanning:roles";
import moment from "moment";
import { Article } from '../articles/article';
import { Poetry } from '../alma-v1/db/collections-poetries';
import { Documents } from '../alma-v1/db/collections-landing';
import { News } from '../../api/news/news';
import { Page } from '../alma-v1/db/collections-pages';
import { AppProfiles } from '../../api/collections-profiles';
import { CoursePrograms, CourseProgramsActive } from '../coursePrograms/coursePrograms';
import { CimCurriculas } from '../alma-v1/db/collections-cimCenter';
import { Homilies } from '../homilies/homilies';
import { Events } from '../events/events'
import { Lecturers } from '../lecturers/lecturers';
import { Prayers, PrayersGroup } from '../../api/prayers/prayers';
import { Quiz } from '../alma-v1/db/collections-quiz';
import { Webinars } from '../webinar/webinar'


Meteor.methods({
    "users.getAll"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners;
        // console.log(Meteor.users.find().fetch());
        return Meteor.users.find({partners: partnerCode}).fetch();
    },
    "users.getAllSuperAdmin"(){
        return Meteor.users.find().fetch();
    },
    async "users.createAppMeteor"(dataSend){
        check(dataSend, Object);

        console.log(dataSend);
        // return

        console.log([dataSend.role]);
        Roles.createRole(dataSend.role, {unlessExists: true});
        // return
        console.log(dataSend.fullname);

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: dataSend.password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                partnerCode = adminPartner.partners[0];
                return await Meteor.users.update({ _id }, { $set: { roles: [dataSend.role], fullname: dataSend.fullname, partners: [partnerCode] } })
            }

        } catch (error) {
            console.log(error);
            return error;
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    async "users.createAppMeteorSuperAdmin"(dataSend){
        check(dataSend, Object);

        console.log(dataSend);
        // return

        Roles.createRole("admin", {unlessExists: true});
        // return

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: dataSend.password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                console.log(adminPartner);
                partnerCode = adminPartner.partners;
                return await Meteor.users.update({ _id }, { $set: { roles: ["admin"], fullname: dataSend.fullname, partners: [dataSend.partners] } })
            }

        } catch (error) {
            console.log(error);
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    "user.remove"(id){
        check(id, String);
        return Meteor.users.remove({_id: id});
    },

    "users.getById"(id){
        check(id, String);
        return Meteor.users.findOne({ _id: id });
    },

    "users.edit"(id, dataSave){
        check(id, String);
        check(dataSave, Object);
        console.log(dataSave);
        return Meteor.users.update({ _id: id }, { $set: { username: dataSave.username, fullname: dataSave.fullname, roles: [dataSave.roles] } })
    },

    "users.editPassword"(id, password){
        check(id, String);
        check(password, String);
        Accounts.setPassword(id, password);
        return true;
    },

    "users-detail" (userId) {
        if (userId) {
          check(userId, String);
        } else {
          userId = this.userId
        }
        return Meteor.users.findOne({ _id: userId });
    },
    async 'cim-checkSlug'(body) {
        check(body, Object);
        const collectionDict = [
          { code: 'poetries', value: Poetry },
          { code: 'articles', value: Article },
          { code: 'documents', value: Documents },
          { code: 'news', value: News },
          { code: 'pages', value: Page },
          { code: 'appProfiles', value: AppProfiles, useObjectId: true },
          { code: 'coursePrograms', value: CoursePrograms, useObjectId: true },
          { code: 'cimCurriculas', value: CimCurriculas },
          { code: 'homilies', value: Homilies },
          { code: 'events', value: Events},
          { code: 'lecturers', value: Lecturers},
          { code: 'prayers', value: Prayers},
          { code: 'quiz', value: Quiz},
          { code: 'webinars', value: Webinars},
          { code: 'prayersGroup', value: PrayersGroup}
        ]
        const getCollection = collectionDict.find((x) => {
          return x.code === body.code
        })
        if(getCollection){
          const query = {}
          if(body.editId && body.editId !== ''){
            let editId = body.editId
            if(getCollection.useObjectId){
              editId = new Meteor.Collection.ObjectID(editId)
            }
            query._id = { $ne: editId }
          }
          query[body.dbField] = body.slug
          const checkExists = await getCollection.value.findOne(query);
          return checkExists
        } else {
          throw Error('No collection was found!')
        }
      }
})
