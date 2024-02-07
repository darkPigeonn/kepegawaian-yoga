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
    
    Meteor.call("notification.getAll", thisUser.emails[0].address, function (error, result) {
        if (result) {
            console.log(result);
            self.notification.set(result);
        } else {
            console.log(error);
        }
    });
});

Template.notification_page.helpers({
    notification() {
        const t = Template.instance()
        const notification = t.notification.get();
        const filter = t.filter.get()

        if(notification){
            const result =  notification.filter((x) => {
                const query = filter.data.toString().toLowerCase();
                                
                if(filter.type == 'nama_task'){
                    return x.nama_task.toString().toLowerCase().includes(query);
                }
                if(filter.type == 'priority'){
                    return x.priority.toString().toLowerCase().includes(query);
                }
                if(filter.type == 'deadline'){
                    const deadline = x.deadline;
                    return moment(deadline).format('DD').includes(query);
                }

                return true
            });
            return result
        }
        else{
            return []
        }
    },
});