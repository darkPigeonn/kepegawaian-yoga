import { Proposals } from "./proposal";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
// import { ObjectId } from 'mongodb';
import _, { result } from 'underscore'

Meteor.methods({
  "proposal.createKosong"(){
    const thisUser = Meteor.users.findOne({_id: this.userId});
    console.log(thisUser);
    return Proposals.insert({
      status: -1,
      createdBy: thisUser._id,
      craetedAt: new Date(),
      partners: thisUser.partners,
    });
  },
  async "getProposals"() {
    const data = Proposals.find().fetch();
    const promise = data.map(async function (x) {  
      const thisUser = await Meteor.users.findOne({_id: x.createdBy})
      x.createdByName = thisUser.fullname
      return x
    })
    const result = await Promise.all(promise)
    // console.log(data);
    return result;
  },
  "myProposals"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    console.log(thisUser);
    const data = Proposals.find({
      createdBy: thisUser._id,
    }).fetch();
    // console.log(data);
    return data.map((x) => {
      x.createdByName = thisUser.fullname
      return x
    });
  },
  async "getProposalById"(id, code) {
    // if (code == 1) {
    //   const dataProposal = Proposals.findOne({
    //     _id: id,
    //   });

    //   const dispositions = dataProposal.dispotitionsContent;
    //   const listDispositions = [];
    //   _.each(dispositions, function (x) {
    //     const data = x;

    //     const thisUser = Meteor.users.findOne({
    //       _id: x.userId,
    //     });
    //     data.fullname = thisUser.fullname;

    //     if (thisUser.schoolId) {
    //       const school = Schools.findOne({
    //         _id: thisUser.schoolId[0],
    //       });

    //       data.unitName = school.name;
    //     } else {
    //       const divisi = Divisions.findOne({
    //         _id: thisUser.divisionId,
    //       });
    //       data.unitName = divisi.name;
    //     }

    //     listDispositions.push(data);
    //   });
    //   return listDispositions;
    // } else {
    //   return Proposals.findOne({
    //     _id: id,
    //   });
    // }
    return Proposals.findOne({
      _id: id,
    });
  },

  "createProposal"(data, tipeKirim) {
    check(data, Object);
    let {name,
      backgroundsDescription,
      purposeDescription,
      timeline,
      fundingRequirementDescription,
      closeDescription,
      alur,
      status} = data;
      // console.log(data);
    let dataAlurObject = [];
    let currentOrder;
    let currentJabatan;
    const thisUser = Meteor.users.findOne({_id: this.userId});
    // console.log(thisUser.roles[0]);
    
    alur.splice(0,0, thisUser.roles[0]);
    // console.log(alur);

    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      // console.log(element);
      let dataAlur = {
          order: index+1,
          jabatan: alur[index],
          analisis: ""
      }
      dataAlurObject.push(dataAlur)
    }

    // for (let index = 0; index < dataAlurObject.length; index++) {
    //   currentOrder = dataAlurObject[0].order;
    //   currentJabatan = dataAlurObject[0].jabatan
    // }
  
    // data.currentOrder = currentOrder;
    // data.currentJabatan = currentJabatan;
    // data.alur = dataAlurObject;
    if(data.status == 0){
      for (let index = 0; index < dataAlurObject.length; index++) {
        currentOrder = dataAlurObject[1].order;
        currentJabatan = dataAlurObject[1].jabatan
      }
    
      data.currentOrder = currentOrder;
      data.currentJabatan = currentJabatan;
      data.alur = dataAlurObject;
      data.log = [
        {
          activity: "revision proposal",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        },
      ];
      // data.currentState.status = 0;
    }
    else{
      for (let index = 0; index < dataAlurObject.length; index++) {
        currentOrder = dataAlurObject[0].order;
        currentJabatan = dataAlurObject[0].jabatan
      }
      data.currentOrder = currentOrder;
      data.currentJabatan = currentJabatan;
      data.alur = dataAlurObject;
      data.log = [
        {
          activity: "create proposal",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        },
      ];
    }
    console.log("Data",data.status);
    return Proposals.update(
      {
        _id: data.id,
      },
      {
        $set: data,
      }
    );
  },

  "editProposal"(data) {
    check(data, Object);

    const id = data.id;
    delete data.id;

    //get data surat
    const dataLetter = Proposals.findOne({
      _id: id,
    });

    //check approval dari level1

    Proposals.update(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );

    return Proposals.update(
      {
        _id: id,
      },
      {
        $set: {
          "currentState.status": 0,
        },
      }
    );
  },

  //proposal diterima oleh reviewer
  async "update.statusProposal"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    console.log(role);
    const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
    console.log(dataProposalByID);
    const alur = dataProposalByID.alur;
    console.log(alur);
    // return;
    const note = {
      note: data.dispositionContent,
      noteBy: thisUser._id,
      noteByName: thisUser.fullname,
    };
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      const alurNext = alur[index+1];
      // console.log(element.order, element.jabatan);
      //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
      if(index === alur.length - 1){
        await Proposals.update({_id: data.proposalId, "alur.jabatan":element.jabatan},
        {
            $set: {"alur.$.analisis": data.dispositionContent, currentOrder: "99", currentJabatan: "Review Selesai", status: 60}
        });
        return Proposals.update(
          {
            _id: data.proposalId,
          },
          {
            $set: {
              updateBy: thisUser._id,
              updateAt: new Date(),
              "currentState.note": data.dispositionContent,
              // "currentState.status": data.status,
              "currentState.updatedAt": new Date(),
            },
            $addToSet: {
              note,
            },
          }
        );
      }
      else {
          if(role == element.jabatan){
              const value = index+2;
              const currentOrder = value.toString();
              await Proposals.update({_id: data.proposalId, "alur.jabatan":element.jabatan},
              {
                  $set: {"alur.$.analisis": data.dispositionContent, currentOrder: currentOrder, currentJabatan: alurNext.jabatan, status: 1}
              });
              return Proposals.update(
                {
                  _id: data.proposalId,
                },
                {
                  $set: {
                    updateBy: thisUser._id,
                    updateAt: new Date(),
                    "currentState.note": data.dispositionContent,
                    // "currentState.status": data.status,
                    "currentState.updatedAt": new Date(),
                  },
                  $addToSet: {
                    note,
                  },
                }
              );
          }
      }
  }
    // const dispotitionsContent = {
    //   userId: thisUser._id,
    //   content: data.dispositionContent,
    //   timestamp: new Date(),
    // };
  },
  //proposal ditolak
  async "update.statusProposalTolak"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    console.log(role);
    const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
    console.log(dataProposalByID);
    const alur = dataProposalByID.alur;
    console.log(alur);
    // return;
    const note = {
      note: data.dispositionContent,
      noteBy: thisUser._id,
      noteByName: thisUser.fullname,
    };
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      if(role == element.jabatan){
        await Proposals.update({_id: data.proposalId, "alur.jabatan":element.jabatan},
        {
            $set: {"alur.$.analisis": data.dispositionContent, status: 99}
        });
        return Proposals.update(
          {
            _id: data.proposalId,
          },
          {
            $set: {
              updateBy: thisUser._id,
              updateAt: new Date(),
              "currentState.note": data.dispositionContent,
              // "currentState.status": data.status,
              "currentState.updatedAt": new Date(),
            },
            $addToSet: {
              note,
            },
          }
        );
      }
  }
    // const dispotitionsContent = {
    //   userId: thisUser._id,
    //   content: data.dispositionContent,
    //   timestamp: new Date(),
    // };
  },

  //revisi proposal
  async "update.revisionProposal"(data) {
    //('hai');
    check(data, Object);
    console.log(data);
    const currentUser = Meteor.user();
    const role = currentUser.roles;
    const note = {
      note: data.note,
      noteBy: currentUser._id,
      noteByName: currentUser.fullname,
    };
    console.log(note);

    await Proposals.update(
      {
        _id: data.letterId,
      },
      {
        $set: {
          updateBy: currentUser._id,
          updateAt: new Date(),
          "currentState.note": data.note,
          // "currentState.status": data.status,
          "currentState.updatedAt": new Date(),
        },
        $addToSet: {
          note,
        },
      }
    );

    //kembalikan ke awal
    const dataProposalByID = Proposals.findOne({ _id: data.letterId });
    const dataUser = Meteor.users.findOne({_id:currentUser._id});
    // console.log(data);
    // console.log(dataUser.roles);
    const roleUser = dataUser.roles;
    const alur = dataProposalByID.alur;
    console.log(roleUser, alur);
    // console.log(dataReview);
    for (let index = 0; index < alur.length; index++) {
        const element = alur[index];
        console.log(element.order, element.jabatan);
        //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
        if(roleUser == element.jabatan){
            return Proposals.update({_id: data.letterId, "alur.jabatan":element.jabatan},
            {
                $set: {"alur.$.analisis": data.note, currentOrder: "1", currentJabatan: alur[0].jabatan, status: 90}
            });
        }
        
    }
  },

  //kirim proposal dari pembuat
  "sentProposal"(data, idUser) {
    check(data, Object);

    const thisProposal = Proposals.findOne({
      _id: data.proposalId,
    });
    console.log(thisProposal);
    //cek diposisi
    const checkValue = isEmptyData(thisProposal);
    if (checkValue) {
      throw new Meteor.Error(404, "Ada data yang belum terisi");
    }
    const dataUser = Meteor.users.findOne({_id:idUser});
    const roleUser = dataUser.roles;
    const alur = thisProposal.alur;
    console.log(alur);
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      const alurNext = alur[index+1];
      // console.log(element.order, element.jabatan);
      //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
      if(index === alur.length - 1){
        // return Document.update({_id: id, "alur.jabatan":element.jabatan},
        //   {
        //       $set: {"alur.$.analisis": dataReview, currentOrder: "99", currentJabatan: "Review Selesai"}
        //   });
      }
      else {
          if(roleUser == element.jabatan){
            const value = index+2;
            const currentOrder = value.toString();
            return Proposals.update({_id: data.proposalId},
            {
                $set: {currentOrder: currentOrder, currentJabatan: alurNext.jabatan, status: 0}
            });
          }
      }
  }
    // Proposals.update({ _id: data.proposalId }, { $set: { status: 0 } });
    return true;
  },

  async "incomingProposals"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles[0];
    const data = Proposals.find({currentJabatan: role}).fetch();
    const promise = data.map(async function (x) {  
      const thisUser = await Meteor.users.findOne({_id: x.createdBy})
      x.createdByName = thisUser.fullname
      return x
    })
    const result = await Promise.all(promise)
    // console.log(data);
    return result;
  },

  "employee.getDataUserProposal"(id){
    const data = Meteor.users.findOne({_id:id});
    // console.log(data);
    return data.roles;
},

});