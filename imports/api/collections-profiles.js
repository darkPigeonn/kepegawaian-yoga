import { Mongo } from "meteor/mongo";


export const AppProfiles = new Mongo.Collection("appProfiles", {
  idGeneration: "MONGO",
});
export const AppUsers = new Mongo.Collection("appUsers", {
  idGeneration: "MONGO",
});
