import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const Evaluation = new Mongo.Collection('evaluations', { idGeneration: 'MONGO' });
export const EvaluationAnswer = new Mongo.Collection('evaluationAnswers', { idGeneration: 'MONGO' });



