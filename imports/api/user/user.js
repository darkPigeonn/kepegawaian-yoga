import { Mongo } from "meteor/mongo";

// export const User = new Mongo.Collection("users");

export const dataListInput = [
  {
    label: "Nama",
    id: "name",
    type: "text",
  },
  {
    label: "Password",
    id: "password",
    type: "password",
  },
  {
    label: "Email",
    id: "email",
    type: "email",
  },
  {
    label: "Nomor Hp",
    id: "telp",
    type: "",
  },
];
