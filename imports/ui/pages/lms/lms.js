import './lms.html';
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.lmsPage.onCreated(function () {
    const self = this;
    self.dataLms = new ReactiveVar();


    Meteor.call("onlineCourses.getAll", function (err, result) {
      if(err){
        console.log(err);
      }else{
        console.log(result);
        self.dataLms.set(result);
      }
    });
})

Template.lmsPage.helpers({
  dataLms : function(){
    return Template.instance().dataLms.get();
  }
})

Template.lmsEdit.onCreated(function () {
    const self = this;

    const id = FlowRouter.current().params._id;
    self.editor = new ReactiveVar();
    self.editor2 = new ReactiveVar()
    // //('prev '+ id);
    self.lmsData = new ReactiveVar();
    self.lmsSessions = new ReactiveVar();
});
Template.lmsEdit.onRendered(function(){
    const context = Template.instance();
    const self = this;

    const id = FlowRouter.current().params._id;
    ;
    Meteor.call('onlineCourses.getById', id, function (error, result) {
        if (error) {
            console.log(error);
        }else{
            console.log(result);
            initEditor(context, {
                content: result.description,
              });
              initEditor(context, {
                toolbarEl: "toolbar-container2",
                  editorEl: "editor2",
                  templateField: "editor2"
              })
              self.lmsData.set(result)
              self.lmsSessions.set(result.sessions)
        }
    });
    // initEditor(Template.instance());
})
Template.lmsEdit.helpers({
  lmsData : function(){
    return Template.instance().lmsData.get();
  },
  getYoutubeId : (url) => {
    const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
})

Template.lmsEdit.events({
    'click #add-session'(e, t){
      e.preventDefault();
        const lmsData = t.lmsData.get();

        const sessionSize = lmsData.sessions.length;

      const name = $("#nameSession").val();
      const description = t.editor2.get().getData();
      const videoUrl = $("#videoUrlSession").val();

      const temp = {
        name,
        description,
        videoUrl,
        additionalFiles : [],
        index : sessionSize + 1
      }

      lmsData.sessions.push(temp);
      t.lmsData.set(lmsData);
      $("#nameSession").val("");
      $("#descriptionSession").val("");
      $("#videoUrlSession").val("");
      t.editor2.get().setData("");
    },

    'submit #lms-form'(e,t){
        e.preventDefault();

        const lmsData = t.lmsData.get();
        const id = FlowRouter.current().params._id;
        Meteor.call('onlineCourses.update', id, lmsData, function (error, result) {
            if (error) {
                console.log(error);
            }else{
                console.log(result);
                // FlowRouter.go('/lms');
            }
        });
    }
})