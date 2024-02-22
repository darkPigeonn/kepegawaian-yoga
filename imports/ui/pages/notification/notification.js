import "./notification.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.notification_page.onCreated(function (){
    const self = this;
    
    self.notification = new ReactiveVar();
    self.filter = new ReactiveVar({
      type: '',
      data: ''
    })
    self.filterMode = new ReactiveVar("1");
    
    const thisUser = Meteor.user();
    
    if (thisUser.emails) {        
        Meteor.call("notification.getAll", thisUser.emails[0].address, function (error, result) {
            if (result) {
                // console.log(result);
                self.notification.set(result);
            } else {
                console.log(error);
            }
        });
    }
});

Template.notification_page.helpers({
    notification() {
        const t = Template.instance()
        const notification = t.notification.get();
        const filter = t.filter.get()

        if(notification){
            const result =  notification.filter((x) => {
                const query = filter.data.toString().toLowerCase();
                console.log(query);
                console.log(filter);
                                
                if(filter.type == 'pesan'){
                    return x.message.toString().toLowerCase().includes(query);
                }
                if(filter.type == 'waktu'){
                    const createdAt = x.createdAt;
                    return moment(createdAt).format('DD').includes(query);
                }

                return true
            });
            return result
        }
        else{
            return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    },
});

Template.notification_page.events({
    'click .tbtn': function(e, t) {
        e.preventDefault();
    
        const targetContainer = $(e.target).closest('.accordion-item').find('.accordion-collapse');
        const button = $(e.target);
        const btnIcon = button.find('i');

        $('.tbtn i').removeClass('fa-minus-circle').addClass('fa-plus-circle');
    
        button.toggleClass('active');
        if (button.hasClass('active')) {
            btnIcon.removeClass('fa-plus-circle').addClass('fa-minus-circle');
            button.attr('aria-expanded', 'true');
            targetContainer.addClass('show');
        } 
        else {
            btnIcon.removeClass('fa-minus-circle').addClass('fa-plus-circle');
            button.attr('aria-expanded', 'false');
            targetContainer.removeClass('show');
        }
    },
    "input .filter"(e, t){
        e.preventDefault();
        
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t){
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t){
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if(filterMode == 2){
            t.filterMode.set("1");
        }
    }
});