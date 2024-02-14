import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from "moment";
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { PeriodeStudis } from './collections.js';
import { tDict } from './dict-assessment.js';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const ItemAnswers = new Mongo.Collection( 'itemAnswers' );

ItemAnswersSchema = new SimpleSchema({
  "name": {
    type: String,
    label: "nama jawaban",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "answerId": {
    type: Number,
    label: "id jawaban",
  },
  "value": {
    type: Number,
    label: "value jawaban",
    allowedValues: [0,1,2,3,4]
  },
});

ItemAnswers.attachSchema( ItemAnswersSchema );


export const ScoringItems = new Mongo.Collection( 'scoringItems' );

ScoringItemsSchema = new SimpleSchema({
  "itemId": {
    type: String,
    label: "ScoreItems ID",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        // return this.value.toLowerCase();
      }
    }
  },
  "group": {
    type: String,
    optional: true,
    label: "Group pertanyaan ini",
    autoform: {
      options: function(){
            return ScoringItemGroups.find().map(function (c) {
          return {label: c.title, value: c._id};
        });
      }
    }
  },
  "question": {
    type: String,
    optional: true
  },
});

ScoringItems.attachSchema( ScoringItemsSchema );


export const ScoringTemplates = new Mongo.Collection( 'scoringtemplates' );

ScoringTemplatesSchema = new SimpleSchema({
  "name": {
    type: String,
    // optional: true,
    label: "ScoringTemplate Name",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "scoringItemGroup": {
    type: Array,
    label: "Scoring Item Group",
    optional: true,
    autoform: {
    }
  },
    "scoringItemGroup.$": {
      type: Object,
      label: "Scoring Item Group",
      optional: true,
    },
      "scoringItemGroup.$.groupId": {
        type: String,
        label: "Scoring Item Group ID",
        optional: true,
        autoform: {
          options: function(){
              return ScoringItemGroups.find().map(function (c) {
                return {label: c.title, value: c._id};
            });
          }
        }
      },
      "scoringItemGroup.$.weight": {
        type: Number,
        label: "Group weight",
        optional: true,
        defaultValue: 0,
        autoform: {
        }
      },
      "scoringItemGroup.$.scoringItem": {
        type: ScoringItems,
        type: Array,
        label: "Scoring Items",
        optional: true,
        // autoform: {
        //  type: "select2",
        //  options: function(){
        //    return ScoringItems.find({
        //        // "group": this.siblingField('group').value
        //      }).map(function (c) {
        //        return {label: c.question, value: c._id};
        //      });
        //  },
      },
        "scoringItemGroup.$.scoringItem.$": {
          // type: ScoringItems,
          type: Object,
          label: "Scoring Items",
          optional: true,
        },
          "scoringItemGroup.$.scoringItem.$.itemId": {
            type: String,
            label: "Scoring Item Id",
            optional: true,
            autoform: {
              type: "hidden"
            },
            autoValue: function () {

              if (this.isInsert) {
                return Random.id();
              } else if (this.isUpsert) {
                return Random.id();
                // return {$setOnInsert: Random.id()};
              } else {
                this.unset();  // Prevent user from supplying their own value
              }
            }
          },
          "scoringItemGroup.$.scoringItem.$.question": {
            type: String,
            label: "Scoring Item question",
            optional: true,
            // autoValue: function(){
            //  return ScoringItems.findOne({
            //    "_id": this.siblingField('itemId').value
            //  }).question;
            // },
            autoform: {
              // type: "hidden"
            }
          },
        "scoringItemGroup.$.groupNote": {
          type: String,
          label: "Catatan Grup",
          optional: true
        },
  "note": {
    type: String,
    label: "Catatan template ini",
    optional: true,
    autoform: {
      rows: 3
    }
  },
});

ScoringTemplates.attachSchema( ScoringTemplatesSchema );


export const ScoringItemGroups = new Mongo.Collection( 'scoringItemGroups' );

ScoringItemGroupsSchema = new SimpleSchema({
  "itemId": {
    type: String,
    label: "group ID",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "title": {
    type: String,
    label: "nama group",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
});

ScoringItemGroups.attachSchema( ScoringItemGroupsSchema );










export const ScoreSheets = new Mongo.Collection( 'scoresheets' );

function getFormDataItemId(formDataItemName){
  return formDataItemName.split('-')[0];
}
function getFormDataGroupId(formDataItemName){
  return formDataItemName.split('-')[1];
}

ScoreSheetSchema = new SimpleSchema({
  "periodeStudi": {
    type: String,
    label: "tahun akademik",
    autoValue: function(){
      let currentPeriodeStudi = PeriodeStudis.findOne({
        "status": true
      });
      return currentPeriodeStudi._id;
    },
    autoform: {
      type: "hidden"
    }
  },
  "acmatkulId": {
    type: String,
    label: "ID Mata Kuliah Aktif",
    autoform: {
      type: "hidden"
    }
  },
  "tingkat": {
    type: Number,
    label: "Tingkat",
    optional: true
  },
  "scoreSheetName": {
    type: String,
    label: "ScoreSheet Name",
    optional: true,
  },
  "createdBy": {
    type: String,
    optional: true,
    label: "dibuat oleh ID",
    autoform: {
      type: "select2",
      options: function(){
            return Meteor.users.find().map(function (c) {
          return {label: c.username, value: c._id};
        });
      }
    }
  },
  "timestamp": {
    type: Date,
    optional: true,
    label: "timestamp",
    autoValue: function(){
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  "templateId": {
    type: String,
    label: "Sheet Template ID",
    optional: true,
    autoform: {
      type: "hidden",
      options: function(){
            return tDict.map(function (c) {
          return {label: c.name, value: c.id};
        });
      }
    }
  },

  "scoreData": {
    type: Array,
    label: "Scoring items DATA",
    optional: true,
  },
  "scoreData.$": {
    type: Object,
    label: "Scoring items DATA",
    optional: true,
  },



    "scoreData.$.groupId": {
      type: String,
      label: "group name",
      optional: true,
    },
    "scoreData.$.itemId": {
      type: String,
      label: "group name",
      optional: true,
    },
    "scoreData.$.itemValue": {
      type: Number,
      label: "item value",
      optional: true
    },

  "lexpFeedback": {
    type: Array,
    label: "Learning Experience Feedback",
    optional: true,
  },
    "lexpFeedback.$": {
      type: Object,
      label: "Learning Experience Feedback",
      optional: true,
    },
    "lexpFeedback.$.itemId": {
      type: String,
      label: "Feedback Item",
      optional: true,
    },
    "lexpFeedback.$.value": {
      type: String,
      label: "Feedback Content",
      optional: true,
    },




  "updatedAt": {
    type: Date,
      autoValue: function() {
        if (this.isUpdate) {
          return new Date();
        }
      },
      denyInsert: true,
      optional: true
  },
  "lastUpdatedById": {
    type: String,
    autoValue: function() {
        if (this.isUpdate) {
          return Meteor.userId();
        }
      },
      denyInsert: true,
      optional: true
  },
  "lastUpdatedByName": {
    type: String,
    autoValue: function() {
        if (this.isUpdate) {
          return Meteor.user().username;
        }
      },
      denyInsert: true,
      optional: true
  }
});

ScoreSheets.attachSchema( ScoreSheetSchema );

