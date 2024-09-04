import { Mongo } from "meteor/mongo";

export const Projects = new Mongo.Collection("projects");
export const Objective = new Mongo.Collection("projectsObjective");
export const Milestone = new Mongo.Collection("projectsMilestone");