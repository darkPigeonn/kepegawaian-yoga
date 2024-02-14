import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { generalPics } from '../../../api/alma-v1/db/collections-files.js';
import datatables from 'datatables.net';

import SimpleSchema from 'simpl-schema';
import _, { template } from 'underscore';

import './evaluation.html';
// import { General } from '../../../api/alma-v1/db/collections-general'
// const arr = new ReactiveArray([]);

Template.evaluationForm.onCreated(function () {
    const self = this;
    this.availability = new ReactiveVar(false);
    let subs = [{
        id: 1,
        status: true
    }]
    this.subs = new ReactiveVar(subs)
    this.outlets = new ReactiveVar([]);
    this.new = new ReactiveVar(true)
   
})

Template.evaluationForm.onRendered(function (){
    const self = this;
    Meteor.call('getEvaluationList', FlowRouter.current().params._id, function (error, res) {
        if(error){
            failAlert(error)
        }
        else{
            if (res){
                let arrsubs = [];
                self.new.set(false)
                let tempsubs = res.questions
                let nomer = 1;
                tempsubs.forEach((element,index) => {
                    let temp = {
                        'id': nomer++,
                        'status': true,
                        'value': element.question,
                        'questionType': element.questionType
                    }
                    arrsubs.push(temp);
                });
                $('#title').val(res.title)
                $('#value').val(res.description)
                self.subs.set(arrsubs)
            }
        }
    });
})


Template.evaluationForm.helpers({
    subs(){
        return Template.instance().subs.get();
    },
    availability(){
        return Template.instance().availability.get();
    },
    outlets(){
        return Template.instance().outlets.get();
    }
});

Template.evaluationForm.events({
    "change .questionType" (e,t){
        const elem = t.subs.get();
        if ($('#pilgan-'+e.target.value).is(":checked")){
            elem[e.target.value].questionType = 'rating'
        } else if ($('#uraian-'+e.target.value).is(":checked")){
            elem[e.target.value].questionType = 'uraian'
        }
        t.subs.set(elem)
    },
    "click .tambah-subs" (e,t) {
        let elem = t.subs.get();
        let newid = elem.length+1;
        // console.log(elem);
        elem.push({
            id:newid,
            status: true,
            questionType: 'uraian'
        });
        t.subs.set(elem);
    },
    "click .cancel" (e,t){
        history.back();
    },
    "click .delete-subs"(e,t){
        let milik = $(e.target).attr('milik');
        // console.log(value);
        let elem = t.subs.get();
        elem[milik-1].status = false;
        t.subs.set(elem);
    },
    "click #insert"(e,t){
        // let milik = e.target.value;
        let title = $('#title').val();
        let value = $('#value').val();
        let postRoute = 'evaluations-insert'

        if (!t.new.get()){
            postRoute = 'evaluations-update'
        }

        if(title.length == 0){

        }

        if(value.length == 0){

        }
 
        let insertsubs = [];
        let subs = t.subs.get();
        subs.forEach(element => {
            if(element.status){
                let temp = {
                    question: $('#value-'+element.id).val(),
                    questionType: element.questionType
                }
                insertsubs.push(temp);
            }
        });
        let data = {
            'title': title,
            'description': value,
            'questions': insertsubs,
            'status': true,
            'createdBy': Meteor.userId(),
            'createdAt': new Date(),
            'evaluateItemId': FlowRouter.current().params._id
        }
        console.log(data)
        Meteor.call(postRoute, data, function (err,res) {
            if (err){
                failAlert(err)
            } else{
                successAlertBack('Berhasil Membuat Evaluasi')
            }
        });
    }
});

// Template.evaluationList.onCreated(function () {
//     const self = this;
//     this.availability = new ReactiveVar(false);
//     let subs = [{
//         id: 1,
//         status: true
//     }]
//     this.subs = new ReactiveVar(subs)
//     this.outlets = new ReactiveVar([]);
//     this.new = new ReactiveVar(true)
// });

// Template.evaluationList.onRendered(function (){
//     const self = this;
//     Meteor.call('getEvaluationList', FlowRouter.current().params._id, function (error, res) {
//         if(error){
//             failAlert(error)
//         }
//         else{
//             if (res){
//                 let arrsubs = [];
//                 self.new.set(false)
//                 let tempsubs = res.questions
//                 let nomer = 1;
//                 tempsubs.forEach((element,index) => {
//                     let temp = {
//                         'id': nomer++,
//                         'status': true,
//                         'value': element.question,
//                         'questionType': element.questionType
//                     }
//                     arrsubs.push(temp);
//                 });
//                 $('#title').val(res.title)
//                 $('#value').val(res.description)
//                 self.subs.set(arrsubs)
//             }
//         }
//     });
// })