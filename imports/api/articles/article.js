import { Mongo } from "meteor/mongo";

export const Article = new Mongo.Collection("articles", { idGeneration: 'MONGO' });