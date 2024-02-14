import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'defaultValue']);

export const Documents = new Mongo.Collection( 'documents' ,{ idGeneration: 'MONGO' });

const DocumentsSchema = new SimpleSchema({
  title: {
    type: String,
    label: "title",
  },
  slug: {
    type: String,
    label: "slug",
    optional: true,
  },
  content: {
    type: String,
    label: "content",
    optional: true,
  },
  contentDelta: {
    type: String,
    label: "contentDelta",
    optional: true,
  },
  // untuk keperluan nuxtjs
  imageLink: {
    type: String,
    label: "imageLink",
    optional: true,
  },
  // untuk keperluan meteor
  imageId: {
    type: String,
    label: "imageId",
    optional: true,
  },
  // untuk keperluan nuxtjs
  fileLink: {
    type: String,
    label: "fileLink",
    optional: true,
  },
  // untuk keperluan meteor
  fileId: {
    type: String,
    label: "fileId",
    optional: true,
  },
  status: {
    type: Boolean,
    label: "Status",
    optional: true,
    defaultValue: true,
  },
  createdAt: {
    type: Date,
    label: "createdAt",
    optional: true,
    defaultValue: new Date(),
  },
  createdBy: {
    type: String,
    label: "createdBy",
    optional: true,
    // defaultValue: Meteor.user().fullname,
  },
  outlets: {
    type: Array,
    label: "outlets",
  },
  "outlets.$": {
    type: String,
    label: "",
  },
});

Documents.attachSchema( DocumentsSchema );