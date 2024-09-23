// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.

import { Roles } from "meteor/alanning:roles";

checkAllowAccess = function (roles) {
  const loggedInUser = Meteor.user();
  if (!loggedInUser || !isInRoles(roles)) {
    throw new Meteor.Error(403, "Not authorized!");
  }
  // if (!loggedInUser || !Roles.userIsInRole(loggedInUser, roles)) {
  //   throw new Meteor.Error(403, 'Not authorized!')
  // }
  return isInRoles(roles);
};

checkAdmin = function () {
  const thisUser = Meteor.userId();
  const relatedUser = Meteor.users.findOne({
    _id: thisUser,
  });

  const userRoles = relatedUser.roles || [];
  const checkRoles = ["admin", "super-admin", "superadmin"];
  const isAdmin = userRoles.some((role) => checkRoles.includes(role));

  return isAdmin;
};

isInRoles = function (roles) {
  const userId = Meteor.userId();
  const relatedUser = Meteor.users.findOne({
    _id: userId,
  });
  const userRoles = relatedUser.roles || [];

  if (!Array.isArray(roles)) {
    const rolesArray = roles.split(",").map((role) => role.trim());
    const cleanRolesArray = rolesArray.map((role) => {
      if (role.startsWith(" ")) {
        return role.substring(1);
      }
      return role;
    });

    return cleanRolesArray.some((role) =>
      userRoles.some((e) => e._id.includes(role))
    );
  } else {
    const checkRole = userRoles.some((e) => e._id.includes(roles));
    return checkRole;
  }
};
