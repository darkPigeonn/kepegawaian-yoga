import { Links } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import './info.html';

Template.info.onCreated(function () {
  Meteor.subscribe('links.all');
});

Template.info.helpers({
  links() {
    return Links.find({});
  },
});

Template.info.events({
  'submit .info-link-add'(event) {
    event.preventDefault();

    const target = event.target;
    const title = target.title;
    const url = target.url;

    Meteor.call('links.insert', title.value, url.value, (error) => {
      if (error) {
        alert(error.error);
      } else {
        title.value = '';
        url.value = '';
      }
    });
  },
});

Template.psActive.onCreated(function () {
  const self = this;
  self.psActive = new ReactiveVar();

  Meteor.call('get-psActive', function(error, result){
    if(error){
      console.log(error);
    }else{
      console.log(result);

      self.psActive.set(result);
    }
  })
});
Template.psActive.helpers({
  item(){
    return Template.instance().psActive.get();
  },
});