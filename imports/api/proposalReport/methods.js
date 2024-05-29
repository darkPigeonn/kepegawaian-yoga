import { ProposalReports } from "./proposalReport";
import { Proposals } from "../proposal/proposal";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
import _, { result } from 'underscore'

Meteor.methods({
    async "proposalReport.create" (data, idProposal) {
        let {name, timestamp, place, description, detailTransaction, totalTransaction, linksTransaction, linksActivity} = data;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        data.timestamp = new Date(timestamp);
        data.createdAt = new Date();
        data.createdBy = thisUser;
        data.createdByName = adminPartner.fullname;
        data.idProposal = idProposal;

        const post = ProposalReports.insert(data);
        console.log(post);
        const updateProposal = Proposals.update({_id: idProposal}, {$set: {idReport: post}})
        return updateProposal;
    }
})