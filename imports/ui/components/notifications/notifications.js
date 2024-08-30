import './notifications.html';

Template.cardNotifications.onCreated(function () {
    const self = this;
    self.notifications = new ReactiveVar();
    Meteor.call("notifications.getByUser",  function (error, result) {
        if (result) {
            self.notifications.set(result);
            console.log(result);
        } else {
            console.log(error);
        }
    });
});
Template.cardNotifications.helpers({
    notifications: function () {
        return Template.instance().notifications.get();
    }
})