import { Proposals } from "./proposal";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
// import { ObjectId } from 'mongodb';
import _, { result } from 'underscore'

Meteor.methods({
  "proposal.createKosong"(){
    const thisUser = Meteor.users.findOne({_id: this.userId});
    // console.log(thisUser);
    return Proposals.insert({
      status: -1,
      createdBy: thisUser._id,
      createdAt: new Date(),
      partners: thisUser.partners[0],
    });
  },
  async "getProposals"() {
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
      });
    partnerCode = adminPartner.partners[0];
    const data = Proposals.find({partners: partnerCode}).fetch();
    const promise = data.map(async function (x) {  
      const thisUser = await Meteor.users.findOne({_id: x.createdBy})
      x.createdByName = thisUser.fullname
      return x
    })
    const result = await Promise.all(promise)
    // console.log(result);
    return result;
  },
  "myProposals"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    // console.log(thisUser);
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
    const dataProposal = Proposals.findOne({
      _id: id,
    });
    return dataProposal;
  },
  //kirim pakai role
  // "createProposal"(data, tipeKirim) {
  //   check(data, Object);
  //   let {name,
  //     backgroundsDescription,
  //     purposeDescription,
  //     timeline,
  //     fundingRequirementDescription,
  //     closeDescription,
  //     alur,
  //     status} = data;
  //     // console.log(data);
  //   let dataAlurObject = [];
  //   let currentOrder;
  //   let currentJabatan;
  //   const thisUser = Meteor.users.findOne({_id: this.userId});
  //   // console.log(thisUser.roles[0]);
    
  //   alur.splice(0,0, thisUser.roles[0]);
  //   // console.log(alur);

  //   for (let index = 0; index < alur.length; index++) {
  //     const element = alur[index];
  //     // console.log(element);
  //     let dataAlur = {
  //         order: index+1,
  //         role: alur[index],
  //         analisis: ""
  //     }
  //     dataAlurObject.push(dataAlur)
  //   }

  //   // for (let index = 0; index < dataAlurObject.length; index++) {
  //   //   currentOrder = dataAlurObject[0].order;
  //   //   currentJabatan = dataAlurObject[0].jabatan
  //   // }
  
  //   // data.currentOrder = currentOrder;
  //   // data.currentJabatan = currentJabatan;
  //   // data.alur = dataAlurObject;
  //   if(data.status == 0){
  //     for (let index = 0; index < dataAlurObject.length; index++) {
  //       currentOrder = dataAlurObject[1].order;
  //       currentJabatan = dataAlurObject[1].role
  //     }
    
  //     data.currentOrder = currentOrder;
  //     data.currentJabatan = currentJabatan;
  //     data.flows = dataAlurObject;
  //     data.logs = [
  //       {
  //         activity: "revision proposal",
  //         createdBy: Meteor.userId(),
  //         createdAt: new Date(),
  //       },
  //     ];
  //     // data.currentState.status = 0;
  //   }
  //   else{
  //     for (let index = 0; index < dataAlurObject.length; index++) {
  //       currentOrder = dataAlurObject[0].order;
  //       currentJabatan = dataAlurObject[0].role
  //     }
  //     data.currentOrder = currentOrder;
  //     data.currentJabatan = currentJabatan;
  //     data.flows = dataAlurObject;
  //     data.logs = [
  //       {
  //         activity: "Proposal Created",
  //         createdBy: Meteor.userId(),
  //         createdAt: new Date(),
  //       },
  //     ];
  //     delete data.alur
  //   }
  //   // console.log("Data",data.status);
  //   return Proposals.update(
  //     {
  //       _id: data.id,
  //     },
  //     {
  //       $set: data,
  //     }
  //   );
  // },

  //kirim pakai user
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
    let currentUsername;
    const thisUser = Meteor.users.findOne({_id: this.userId});
    alur.unshift(thisUser.username)
    console.log(alur);
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      // console.log(element);
      let dataAlur = {
        order: index+1,
        username: alur[index],
        analisis: ""
      }
      dataAlurObject.push(dataAlur)
    }
    console.log(dataAlurObject);

    if(data.status == 0){
      for (let index = 0; index < dataAlurObject.length; index++) {
        currentOrder = dataAlurObject[1].order;
        currentUsername = dataAlurObject[1].currentUsername
      }
    
      data.currentOrder = currentOrder;
      data.currentUsername = currentUsername;
      data.flows = dataAlurObject;
      data.logs = [
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
        currentUsername = dataAlurObject[0].username
      }
      data.currentOrder = currentOrder;
      data.currentUsername = currentUsername;
      data.flows = dataAlurObject;
      data.logs = [
        {
          activity: "Proposal Created",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        },
      ];
      delete data.alur
    }
    // console.log("Data",data.status);
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

  //proposal diterima oleh reviewer (roles)
  // async "update.statusProposal"(data) {
  //   check(data, Object);
  //   const thisUser = Meteor.users.findOne({_id: this.userId});
  //   const role = thisUser.roles;
  //   // console.log(role);
  //   const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
  //   // console.log(dataProposalByID);
  //   const alur = dataProposalByID.flows;
  //   // console.log(alur);
  //   // return;
  //   const note = {
  //     note: data.dispositionContent,
  //     noteBy: thisUser._id,
  //     noteByName: thisUser.fullname,
  //   };
  //   for (let index = 0; index < alur.length; index++) {
  //     const element = alur[index];
  //     const alurNext = alur[index+1];
  //     // console.log(element.order, element.jabatan);
  //     //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
  //     if(index === alur.length - 1){
  //       const dataLogs = {
  //         activity: "Review of the proposal is finished and accepted",
  //         createdBy: Meteor.userId(),
  //         createdAt: new Date(),
  //       }
  //       await Proposals.update({_id: data.proposalId, "flows.role":element.role},
  //       {
  //           $set: {"alur.$.analisis": data.dispositionContent, currentOrder: "99", currentJabatan: "Review Selesai", status: 60},
  //           $push: {logs: dataLogs}
  //         });
  //       return Proposals.update(
  //         {
  //           _id: data.proposalId,
  //         },
  //         {
  //           $set: {
  //             updateBy: thisUser._id,
  //             updateAt: new Date(),
  //             "currentState.note": data.dispositionContent,
  //             // "currentState.status": data.status,
  //             "currentState.updatedAt": new Date(),
  //           },
  //           $addToSet: {
  //             note,
  //           },
  //         }
  //       );
  //     }
  //     else {
  //         if(role == element.role){
  //             const value = index+2;
  //             const currentOrder = value.toString();
  //             const dataLogs = {
  //               activity: "Proposal Accepted",
  //               createdBy: Meteor.userId(),
  //               createdAt: new Date(),
  //             }
  //             await Proposals.update({_id: data.proposalId, "flows.role":element.role},
  //             {
  //                 $set: {"flows.$.analisis": data.dispositionContent, currentOrder: currentOrder, currentJabatan: alurNext.role, status: 1},
  //                 $push: {logs: dataLogs}
  //             });
  //             return Proposals.update(
  //               {
  //                 _id: data.proposalId,
  //               },
  //               {
  //                 $set: {
  //                   updateBy: thisUser._id,
  //                   updateAt: new Date(),
  //                   "currentState.note": data.dispositionContent,
  //                   // "currentState.status": data.status,
  //                   "currentState.updatedAt": new Date(),
  //                 },
  //                 $addToSet: {
  //                   note,
  //                 },
  //               }
  //             );
  //         }
  //     }
  // }
  //   // const dispotitionsContent = {
  //   //   userId: thisUser._id,
  //   //   content: data.dispositionContent,
  //   //   timestamp: new Date(),
  //   // };
  // },
  //proposal ditolak (roles)
  async "update.statusProposalTolak"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    // console.log(role);
    const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
    // console.log(dataProposalByID);
    const alur = dataProposalByID.flows;
    // console.log(alur);
    // return;
    const note = {
      note: data.dispositionContent,
      noteBy: thisUser._id,
      noteByName: thisUser.fullname,
    };
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      if(role == element.role){
        const dataLogs = {
          activity: "Proposal Declined",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        }
        await Proposals.update({_id: data.proposalId, "flows.role":element.role},
        {
            $set: {"flows.$.analisis": data.dispositionContent, status: 99},
            $push: {logs: dataLogs}
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

  //revisi proposal (roles)
  // async "update.revisionProposal"(data) {
  //   //('hai');
  //   check(data, Object);
  //   // console.log(data);
  //   const currentUser = Meteor.user();
  //   const role = currentUser.roles;
  //   const note = {
  //     note: data.note,
  //     noteBy: currentUser._id,
  //     noteByName: currentUser.fullname,
  //   };

  //   await Proposals.update(
  //     {
  //       _id: data.letterId,
  //     },
  //     {
  //       $set: {
  //         updateBy: currentUser._id,
  //         updateAt: new Date(),
  //         "currentState.note": data.note,
  //         // "currentState.status": data.status,
  //         "currentState.updatedAt": new Date(),
  //       },
  //       $addToSet: {
  //         note,
  //       }
  //     }
  //   );

  //   //kembalikan ke awal
  //   const dataProposalByID = Proposals.findOne({ _id: data.letterId });
  //   const dataUser = Meteor.users.findOne({_id:currentUser._id});
  //   const roleUser = dataUser.roles;
  //   const alur = dataProposalByID.flows;
  //   const dataLogs = {
  //     activity: "Proposal Revision",
  //     createdBy: Meteor.userId(),
  //     createdAt: new Date(),
  //   }
  //   for (let index = 0; index < alur.length; index++) {
  //       const element = alur[index];
  //       //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
  //       if(roleUser == element.role){
  //           return Proposals.update({_id: data.letterId, "flows.role":element.role},
  //           {
  //               $set: {"alur.$.analisis": data.note, currentOrder: "1", currentJabatan: alur[0].role, status: 90},
  //               $push: {logs: dataLogs}
  //           });
  //       }
        
  //   }
  // },


  //proposal diterima oleh reviewer (per user)
  async "update.statusProposal"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const username = thisUser.username;
    const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
    const alur = dataProposalByID.flows;
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
        const dataLogs = {
          activity: "Review of the proposal is finished and accepted",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        }
        await Proposals.update({_id: data.proposalId, "flows.username":element.username},
        {
            $set: {"alur.$.analisis": data.dispositionContent, currentOrder: "99", currentUsername: "Review Selesai", status: 60},
            $push: {logs: dataLogs}
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
          if(username == element.username){
              const value = index+2;
              const currentOrder = value.toString();
              const dataLogs = {
                activity: "Proposal Accepted",
                createdBy: Meteor.userId(),
                createdAt: new Date(),
              }
              await Proposals.update({_id: data.proposalId, "flows.username":element.username},
              {
                  $set: {"flows.$.analisis": data.dispositionContent, currentOrder: currentOrder, currentUsername: alurNext.username, status: 1},
                  $push: {logs: dataLogs}
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
  },

  //revisi proposal (per user)
  async "update.revisionProposal"(data) {
    check(data, Object);
    const currentUser = Meteor.user();
    const role = currentUser.roles;
    const note = {
      note: data.note,
      noteBy: currentUser._id,
      noteByName: currentUser.fullname,
    };

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
        }
      }
    );

    //kembalikan ke awal
    const dataProposalByID = Proposals.findOne({ _id: data.letterId });
    const dataUser = Meteor.users.findOne({_id:currentUser._id});
    const usernameUser = dataUser.username;
    const alur = dataProposalByID.flows;
    const dataLogs = {
      activity: "Proposal Revision",
      createdBy: Meteor.userId(),
      createdAt: new Date(),
    }
    for (let index = 0; index < alur.length; index++) {
        const element = alur[index];
        //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
        if(usernameUser == element.username){
            return Proposals.update({_id: data.letterId, "flows.username":element.username},
            {
                $set: {"alur.$.analisis": data.note, currentOrder: "1", currentUsername: alur[0].username, status: 90},
                $push: {logs: dataLogs}
            });
        }
        
    }
  },

  //proposal ditolak (per user)
  async "update.statusProposalTolak"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const username = thisUser.username;
    // console.log(role);
    const dataProposalByID = Proposals.findOne({ _id: data.proposalId });
    // console.log(dataProposalByID);
    const alur = dataProposalByID.flows;
    // console.log(alur);
    // return;
    const note = {
      note: data.dispositionContent,
      noteBy: thisUser._id,
      noteByName: thisUser.fullname,
    };
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      if(username == element.username){
        const dataLogs = {
          activity: "Proposal Declined",
          createdBy: Meteor.userId(),
          createdAt: new Date(),
        }
        await Proposals.update({_id: data.proposalId, "flows.username":element.username},
        {
            $set: {"flows.$.analisis": data.dispositionContent, status: 99},
            $push: {logs: dataLogs}
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

  //kirim proposal dari pembuat (versi roles)
  // "sentProposal"(data, idUser) {
  //   try {
  //     check(data, Object);
  //     const thisProposal = Proposals.findOne({
  //       _id: data.proposalId,
  //     });
  //     //cek diposisi
  //     const checkValue = isEmptyData(thisProposal);
  //     if (checkValue) {
  //       throw new Meteor.Error(404, "Ada data yang belum terisi");
  //     }
  //     const dataUser = Meteor.users.findOne({_id:idUser});
  //     const roleUser = dataUser.roles;
  //     const alur = thisProposal.flows;
  //     for (let index = 0; index < alur.length; index++) {
  //       const element = alur[index];
  //       const alurNext = alur[index+1];
  //       // console.log(element.order, element.jabatan);
  //       //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
  //       if(index === alur.length - 1){
  //         // return Document.update({_id: id, "alur.jabatan":element.jabatan},
  //         //   {
  //         //       $set: {"alur.$.analisis": dataReview, currentOrder: "99", currentJabatan: "Review Selesai"}
  //         //   });
  //       }
  //       else {
  //           if(roleUser == element.role){
  //             const value = index+2;
  //             const currentOrder = value.toString();
  //             const dataLogs = {
  //               activity: "Proposal Sended",
  //               createdBy: Meteor.userId(),
  //               createdAt: new Date(),
  //             }
  //             return Proposals.update({_id: data.proposalId},
  //             {
  //                 $set: {currentOrder: currentOrder, currentJabatan: alurNext.role, status: 0},
  //                 $push: {logs: dataLogs}
  //             });
  //           }
  //       }
  //     }
  //   // return Proposals.update({ _id: data.proposalId }, { $set: { status: 0 } });
  //   } catch (error) {
  //     //console.log(error);
  //     return error
  //   }
    
  // },

  //kirim proposal dari pembuat (versi user)
  "sentProposal"(data, idUser) {
    try {
      check(data, Object);
      const thisProposal = Proposals.findOne({
        _id: data.proposalId,
      });
      //cek diposisi
      const checkValue = isEmptyData(thisProposal);
      if (checkValue) {
        throw new Meteor.Error(404, "Ada data yang belum terisi");
      }
      const dataUser = Meteor.users.findOne({_id:idUser});
      const usernameUser = dataUser.username;
      const alur = thisProposal.flows;
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
            if(usernameUser == element.username){
              const value = index+2;
              const currentOrder = value.toString();
              const dataLogs = {
                activity: "Proposal Sended",
                createdBy: Meteor.userId(),
                createdAt: new Date(),
              }
              const cek = Proposals.update({_id: data.proposalId},
              {
                  $set: {currentOrder: currentOrder, currentUsername: alurNext.username, status: 0},
                  $push: {logs: dataLogs}
              });
              console.log(cek);
              return cek
            }
        }
      }
    // return Proposals.update({ _id: data.proposalId }, { $set: { status: 0 } });
    } catch (error) {
      //console.log(error);
      return error
    }
    
  },

  // punya roles
  // async "incomingProposals"() {
  //   const thisUser = Meteor.users.findOne({_id: this.userId});
  //   const role = thisUser.roles[0];
  //   const data = Proposals.find({currentJabatan: role}).fetch();
  //   const promise = data.map(async function (x) {  
  //     const thisUser = await Meteor.users.findOne({_id: x.createdBy})
  //     x.createdByName = thisUser.fullname
  //     return x
  //   })
  //   const result = await Promise.all(promise)
  //   // console.log(data);
  //   return result;
  // },

  //punya per user
  async "incomingProposals"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles[0];
    const data = Proposals.find({currentUsername: thisUser.username}).fetch();
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
    console.log(id);
    const data = Meteor.users.findOne({_id:id});
    const dataEmployee = Employee.findOne({_id: data.profileId})
    return {username: data.username, roles: data.roles, full_name: dataEmployee.full_name}
  },

  "employee.getFullName"(id){
    const data = Meteor.users.findOne({_id:id});
    return data.fullname;
  },

  "proposal.getHistoryByPengisi"(nama){
    const data = Proposals.find({"note.noteByName": nama}).fetch();
    // console.log(data.length);
    if(data.length != 0){
      const pembuat = data[0].createdBy;
      const thisUser = Meteor.users.findOne({_id: pembuat});
      const dataFilter = data.filter((x) => {
          return x.note.find((y) => y.note.length && y.noteByName == nama)
      }).map((x) => {
        x.createdByName = thisUser.fullname
        return x
      });
      return dataFilter
    }
    else{
      return;
    }
  },

});