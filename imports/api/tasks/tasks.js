import { Mongo } from "meteor/mongo";

export const Tasks = new Mongo.Collection("tasks");
export const Events = new Mongo.Collection("events");
export const Status = new Mongo.Collection("status");