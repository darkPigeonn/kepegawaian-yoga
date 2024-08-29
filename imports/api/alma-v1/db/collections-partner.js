import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Partner } from '../../administrasi/administrasi';
import { AppProfiles, AppUsers } from "../../collections-profiles";


Meteor.methods({
    'partners-getAll': function (){
        return Partner.find().fetch();
    },
    'partners-insert': function(data){
        Partner.insert(data)
    },
    'partners-update': function (data) {
        check (data, Object);
        console.log(data)

        const id = data.id;
        delete data.id;

        return Partner.update(
            {
                '_id': id
            },
            {
                $set: data
            }
        )
    },
    'partners-getDetails': function (param) {
        console.log(param)
        return Partner.findOne({'_id': param});
    },
    async myPartners(){
        const thisUser = Meteor.user();
        console.log(thisUser);

        const thisUserParners = thisUser.partners;

        const dataReturn = [];

        for (let index = 0; index < thisUserParners.length; index++) {
          const element = thisUserParners[index];

          const partner = await Partner.findOne({
            'code' : element
          });

          dataReturn.push(partner);

        }

        if (dataReturn.length == 0) {
            throw new Meteor.Error(412, "Gagal get partner")
        } else {
            return dataReturn;
        }
    },

    async 'partner-mutation'(user, newPartner) {
        check(user, Object);
        check(newPartner, String);
        //pastikan data partner ada
        const thisPartner = Partner.findOne({ "code": newPartner });

        if (!thisPartner) {
            throw new Meteor.Error(403, "Partner Tidak Ditemukan")
        }
        //update di App Profiles
        const id = user._id.toHexString();
        const thisAppProfiles = AppProfiles.findOne({ _id: user._id })
        if (!thisAppProfiles) {
            throw new Meteor.Error(403, "User Tidak Ditemukan")
        }
        const thisAppUsers = AppUsers.findOne({
            profileId: id
        });
        if (!thisAppUsers) {
            throw new Meteor.Error(403, "User Tidak Ditemukan");
        }

        await AppProfiles.update({
            '_id': user._id
        }, {
            $set: {
                outlets: [newPartner]
            }
        });
        return AppUsers.update({ _id: thisAppUsers._id }, {
            $set: {
                outlets: [newPartner],
                partners: [newPartner]
            }
        });


    }
});