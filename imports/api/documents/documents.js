import { Mongo } from "meteor/mongo";

export const Document = new Mongo.Collection("documents");
export const Letters = new Mongo.Collection("letters");
