import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const Webinars = new Mongo.Collection('webinars');
export const WebinarEnrollments = new Mongo.Collection('webinarEnrollments')



