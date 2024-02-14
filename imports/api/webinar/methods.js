import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles';
import { HTTP } from 'meteor/http';
import _ from 'underscore';

import { Webinars, WebinarEnrollments } from './webinar.js';
import { ZoomAccountSchedules, Zoom } from "../alma-v1/db/collections-zoom.js";
import XLSX from 'xlsx';


process.env.NETLIFY_HOOKURL = Meteor.settings.NETLIFY_HOOKURL;
process.env.NETLIFY_HOOKURL_CIM = Meteor.settings.NETLIFY_HOOKURL_CIM;
process.env.NETLIFY_HOOKURL_CIM_MY = Meteor.settings.NETLIFY_HOOKURL_CIM_MY;
process.env.APP_ID = Meteor.settings.APP_ID;
process.env.APP_SECRET = Meteor.settings.APP_SECRET;
process.env.USE_LOCAL = Meteor.settings.USE_LOCAL;
process.env.ID = Meteor.settings.ID;
process.env.SECRET = Meteor.settings.SECRET;

Meteor.methods({
    'uploadExcelFile': function (fileData) {
      const workbook = XLSX.read(fileData, { type: 'binary' });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      return jsonData;
    },
    "webinars-participantInsert": function (data){
      WebinarEnrollments.remove({webinarId: data.webinarId}, {multi: true})
      const participants = data.participants
      participants.forEach(element => {
        element.webinarId = data.webinarId
        WebinarEnrollments.insert(element);
      });
   
      return "Berhasil Insert"
    },
    'webinar-certificateSend': function (data){
      const postURL =
      process.env.USE_LOCAL === "true"
        ? "http://localhost:3005"
        : "https://api.imavi.org";

      const partner = "general";
      const response = HTTP.call(
        "POST",
        `${postURL}/cim/webinars/send-certificate`,
        {
          headers: {
            Id: process.env.APP_IDCLIENT,
            Secret: process.env.APP_SECRETCLIENT,
            partner,
          },
          data
        }
      );
      return response
    },
    "webinars-participantList": function (_id){
      const webinarEnrollments = WebinarEnrollments.find({webinarId: _id}).fetch()
      return webinarEnrollments
    },
    "webinars-getAll": async function (body){
        return Webinars.find().fetch()
    },
    "getWebinarsParticipants": function (_id) {
      const webinar = Webinars.findOne({_id})
      return webinar.participantList
    },
    "webinars-getDetail": async function (_id){
        return Webinars.findOne({_id})
    },
    "webinars-insert": async function (body) {
        if (body.zoom) {
          const zoomAccount = Zoom.findOne({ _id: body.zoomAccountId });
          const oauth = await HTTP.call(
            "POST",
            "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
              zoomAccount.clientAccountId,
            {
              auth: zoomAccount.clientId + ":" + zoomAccount.clientKey,
            }
          );
          const accessToken = "Bearer " + oauth.data.access_token;
          const zoom = await HTTP.call(
            "POST",
            "https://api.zoom.us/v2/users/me/meetings",
            {
              headers: {
                Authorization: accessToken,
                "Content-Type": "application/json",
              },
              data: {
                topic: body.name,
                default_password: true,
                duration: 240,
                start_time: moment(body.date)
                  .utcOffset("+07:00")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            }
          );
          body.meetingId = zoom.data.id.toString();
          body.zoomUrl = zoom.data.join_url;
          body.meetingPassword = zoom.data.password;
        }
        return Webinars.insert(body);
      },
      "webinars-update": async function (data) {
        const _id = data._id;
        const thisWebinars = Webinars.findOne({ _id });
        const dateGet = data.date;
        delete data._id;
        if (data.zoom) {
          const zoomAccount = Zoom.findOne({ _id: thisWebinars.zoomAccountId });
          const oauth = await HTTP.call(
            "POST",
            "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
              zoomAccount.clientAccountId,
            {
              auth: zoomAccount.clientId + ":" + zoomAccount.clientKey,
            }
          );
          try {
            const accessToken = "Bearer " + oauth.data.access_token;
            const update = await HTTP.call(
              "PATCH",
              "https://api.zoom.us/v2/meetings/" + thisWebinars.meetingId,
              {
                headers: {
                  Authorization: accessToken,
                  "Content-Type": "application/json",
                },
                data: {
                    start_time: moment(data.date)
                    .utcOffset("+07:00")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                }
              }
            );
          } catch (exception) {
            console.log(exception);
          }
        }
        delete data.zoomStatus
        return Webinars.update({ _id: _id }, { $set: data });
      },
      "webinars-delete": async function (data) {
        if (data.meetingId) {
          const thisWebinars = Webinars.findOne({ _id: data._id });
          try {
            const zoomAccount = Zoom.findOne({ _id: thisWebinars.zoomAccountId });
            const oauth = await HTTP.call(
              "POST",
              "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
                zoomAccount.clientAccountId,
              {
                auth: zoomAccount.clientId + ":" + zoomAccount.clientKey,
              }
            );
            const accessToken = "Bearer " + oauth.data.access_token;
            const deleteZoom = await HTTP.call(
              "DELETE",
              "https://api.zoom.us/v2/meetings/" + data.meetingId,
              {
                headers: {
                  Authorization: accessToken,
                  "Content-Type": "application/json",
                },
              }
            );
          } catch (exception) {
            console.log(exception);
          }
        }
        Webinars.remove({ _id: data._id });
        return "Berhasil Menghapus Pertemuan";
      },
})