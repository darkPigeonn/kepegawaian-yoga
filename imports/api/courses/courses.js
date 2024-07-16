import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import moment from "moment";
import SimpleSchema from "simpl-schema";


export const Courses = new Mongo.Collection("courses", { idGeneration: 'MONGO' });
export const AcitveCourses = new Mongo.Collection("activeCourses", { idGeneration: 'MONGO' });
export const Meetings = new Mongo.Collection("meetings", { idGeneration: 'MONGO' });
export const Assignments = new Mongo.Collection('assignments', {idGeneration: 'MONGO'})
export const StudentsAttedances = new Mongo.Collection("studentsAttedances", { idGeneration: 'MONGO' });
export const Quizzes = new Mongo.Collection('landingQuiz', {idGeneration: 'MONGO'});
export const Forums = new Mongo.Collection('forums', {idGeneration: 'MONGO'});
export const StudentsCompletion = new Mongo.Collection('studentsCompletion', {idGeneration : 'MONGO'})