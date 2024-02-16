import { Roles } from 'meteor/alanning:roles';

isInRoles = function(roles) {
  const userId = Meteor.userId();
  const relatedUser = Meteor.users.findOne({
      _id: userId,
  });

  const userRoles = relatedUser.roles || [];
  
  if (!Array.isArray(roles)) {
    const rolesArray = roles.split(',').map(role => role.trim());
    const cleanRolesArray = rolesArray.map(role => {
      if (role.startsWith(" ")) {
        return role.substring(1);
      }
      return role;
    });

    return cleanRolesArray.some(role => userRoles.includes(role));
  }
  else{
    const checkRole =  userRoles.includes(roles[0]);
    return checkRole;
  }
}

checkAllowAccess = function(roles){
  const loggedInUser = Meteor.user();
  if (!loggedInUser || !isInRoles(roles)) {
    throw new Meteor.Error(403, 'Not authorized!')
  }
  // if (!loggedInUser || !Roles.userIsInRole(loggedInUser, roles)) {
  //   throw new Meteor.Error(403, 'Not authorized!')
  // }
  return isInRoles(roles);
}


