import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const CoursePrograms = new Mongo.Collection('coursePrograms', { idGeneration: 'MONGO' });
export const CourseProgramsActive = new Mongo.Collection('activeCoursePrograms', { idGeneration: 'MONGO' });
export const AcpMaterials = new Mongo.Collection('acpMaterials');
export const Meetings = new Mongo.Collection('Meetings', { idGeneration: 'MONGO' });



