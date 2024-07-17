import { Employee } from "../employee/employee";
import { Permits, StaffsAttendance } from "./attendance";

Meteor.publish("attendanceToday", function() {
    let loggedInUser = Meteor.user();

    const startDate = moment().utcOffset("+07:00").startOf("day");
    const endDate = moment().utcOffset("+07:00").endOf("day");
    return StaffsAttendance.find({
        checkIn: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
            },
    });
});
Meteor.publish("permitsToday", function() {
    let loggedInUser = Meteor.user();

    const startDate = moment().utcOffset("+07:00").startOf("day");
    const endDate = moment().utcOffset("+07:00").endOf("day");
    return Permits.find({
        $or : [
            {
                startDatePermit: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                    },
            },{
                endDatePermit: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                    },
            }
        ]
    })

});
Meteor.publish("myEmployee", function() {
    const thisUser = Meteor.users.findOne({_id : this.userId})

    return Employee.find({
        $or : [
            {

                'outlets' : thisUser.partners
            },
            {
                'partnerCode' : thisUser.partners[0]
            }

        ]
    })
});