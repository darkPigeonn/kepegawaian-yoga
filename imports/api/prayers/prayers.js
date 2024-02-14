import { Mongo } from "meteor/mongo";

export const Prayers = new Mongo.Collection('prayers', { idGeneration: 'MONGO' } );
export const PrayersGroup = new Mongo.Collection('prayersGroup')