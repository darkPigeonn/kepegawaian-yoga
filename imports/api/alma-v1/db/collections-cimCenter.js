import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

export const CimCurriculas = new Mongo.Collection( 'cimCurriculas' );
export const IvanTeams = new Mongo.Collection( 'ivanTeams', {idGeneration:'MONGO' } );