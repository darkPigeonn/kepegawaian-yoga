import "./forms.html";

Template.formLecturers.onCreated(function () {
    this.formPage = new ReactiveVar(1);
});

Template.formLecturers.helpers({
    formPage(){
        return Template.instance().formPage.get();
    }
});

Template.formLecturers.events({
    'click .btnNavigation' (e, t){
        const getValue = $(e.target).attr('data-value');
        t.formPage.set(getValue);
    },
    'click .btn-next' (e, t){
        const getValue = $(e.target).val();
        t.formPage.set(getValue);
    },
    'click .btn-previous' (e, t){
        const getValue = $(e.target).val();
        t.formPage.set(getValue);
    }
});