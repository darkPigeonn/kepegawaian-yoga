Meteor.publish("user.me", function () {
  console.log(this.userId);
  return Meteor.users.find(
    {
      _id: this.userId,
    },
    {
      fields: {
        profileId: 1,
        AnggotaID: 1,
        ParokiID: 1,
        fullname: 1,
        roles: 1,
        lingkunganCode: 1,
        wilayahName: 1,
        wilayahId: 1,
      },
    }
  );
});
