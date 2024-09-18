import { Mongo } from "meteor/mongo";

export const Salaries = new Mongo.Collection("salaries");
export const SalariesActionRequests = new Mongo.Collection("salariesActionRequests");