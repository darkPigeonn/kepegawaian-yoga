import { Mongo } from "meteor/mongo";

export const Reflections = new Mongo.Collection("reflections");
export const ConfigReflections = new Mongo.Collection("configReflections");
export const Category = new Mongo.Collection("categories");
export const Question = new Mongo.Collection("questions");
export const TemplateReflection = new Mongo.Collection("templateReflections");
