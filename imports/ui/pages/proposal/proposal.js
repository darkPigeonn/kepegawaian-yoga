import './proposal.html'
import _, { result } from 'underscore'
import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.listProposals.onCreated(function () {
    // arr.clear();
    const self = this;
    self.nowLoading = new ReactiveVar(true);

    self.proposalId = new ReactiveVar();
    self.getProposals = new ReactiveVar();
    self.proposalsPanding = new ReactiveVar();
    self.proposalsNew = new ReactiveVar();
    self.proposalsRevision = new ReactiveVar();
    self.proposalsReview = new ReactiveVar();
    self.proposalsApprove = new ReactiveVar();
    self.proposalsIncoming = new ReactiveVar();
    self.proposalsRejected = new ReactiveVar();
    self.schools = new ReactiveVar();
    self.selectedSchools = new ReactiveVar();
    self.dataLogin = new ReactiveVar();
    self.dataProposalHistory = new ReactiveVar();

    //-------//
    self.myProposals = new ReactiveVar();
    Meteor.call('myProposals', function (error, result) {
        if (result) {
            console.log('My Proposal');
            console.log(result);
            self.myProposals.set(result)
        }
    });
    // Meteor.call('getProposals', function (error, result) {
    //     if (result) {
    //         console.log('Get Proposal');
    //         console.log(result);
    //         // self.myProposals.set(result)
    //     }
    // });

    self.incomingProposals = new ReactiveVar();
    Meteor.call('incomingProposals', function (error, result) {
        console.log(result);
        if (result) {
            self.incomingProposals.set(result)
        }
        else{
            console.log(error);
        }
    });

    Meteor.call('getProposals', function (error, result) {
        if (result) {
            self.getProposals.set(result);
        }
    });

    const userId = Meteor.userId();
    // console.log(userId);
    if(userId){
      Meteor.call("employee.getFullName", userId, function (error, result) { 
        if(result){
          const dataLogin = result;
          self.dataLogin.set(dataLogin);
        //   console.log(dataLogin);
          Meteor.call("proposal.getHistoryByPengisi", dataLogin, function (error, result) {
            if(result){
              self.dataProposalHistory.set(result)
              console.log(result);
            }
            else{
              console.log(error);
            }
          })
        }
        else{
          console.log(error);
        }
      })
    }

});
Template.listProposals.helpers({
    myProposals() {
        return Template.instance().myProposals.get();
    },
    incomingProposals() {
        return Template.instance().incomingProposals.get()
    },
    schools() {
        // untuk filter
        const schools = Template.instance().schools.get();
        if (schools && schools.length > 0) {
            return schools;
        }
    },
    dateNow() {
        return Template.instance().deadlineProposal.get();
    },
    proposals: function () {
        const proposals = Template.instance().getProposals.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsApprove: function () {
        const proposals = Template.instance().proposalsApprove.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsPanding: function () {
        const proposals = Template.instance().proposalsPanding.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsNew: function () {
        const proposals = Template.instance().proposalsNew.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsRevision: function () {
        const proposals = Template.instance().proposalsRevision.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsReview: function () {
        const proposals = Template.instance().proposalsReview.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsIncoming: function () {
        const proposals = Template.instance().proposalsIncoming.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    proposalsRejected: function () {
        const proposals = Template.instance().proposalsRejected.get();
        let SchoolFilter = Template.instance().selectedSchools.get();

        // //(SchoolFilter);

        if (SchoolFilter && SchoolFilter.length > 0) {
            const filtered = _.filter(proposals, function (x) {
                return SchoolFilter.indexOf(x.schoolId) !== -1;
            });
            // //(filtered);
            if (filtered && filtered.length > 0) {
                return filtered;
            }
        } else {
            return proposals;
        }
    },
    dataLogin(){
        return Template.instance().dataLogin.get();
    },
    dataProposalHistory(){
        return Template.instance().dataProposalHistory.get();
    }

});
Template.listProposals.events({
    "click .deleteItem"(e, t) {
        // //('masuk');
        const id = this._id;
        // //(id);

        Meteor.call('deleteLetter', id, function (error, result) {
            if (result) {
                Bert.alert({
                    title: 'Success',
                    message: "Terhapus!",
                    type: 'success',
                    style: 'growl-top-right',
                    icon: 'fa-thumbs-up'
                });

            } else {
                Bert.alert({
                    title: 'Error',
                    message: error.reason,
                    type: 'danger',
                    style: 'growl-top-right',
                    icon: 'fa-times'
                });
            }
        })
    },
    // "click #btn-lihat"(e, t) {

    //     //update status surat dilihat
    //     const proposalId = $(e.target).attr("milik");

    //     //kode untuk melihat adalah 2
    //     const status = 20;
    //     const thisUser = Meteor.user();
    //     const data = {
    //         proposalId,
    //         status,
    //         'reviewBy' : thisUser.fullname,
    //         'reviewAt' : new Date()
    //     };
    //     Meteor.call('update.statusProposal', data, function (error, result) {
    //         if (result) {

    //         } else {
    //             alert(error)
    //         }
    //     });

    // },
    "click #btn-approve"(e, t) {
        e.preventDefault();
        const proposalId = $(e.target).attr("milik");
        const code = $(e.target).attr("code");

        t.proposalId.set(proposalId);
        if (code == "1") {
            const thisUser = Meteor.user();

            const status = 1;
            const dispositionContent = $('#dispotitionContent').val();

            const data = {
                proposalId,
                status,
                dispositionContent
            };
            if (Roles.userIsInRole(thisUser, ['staff'])) {
                data.status = 'disposisi'
            }

            Meteor.call('update.statusProposal', data, function (error, result) {
                if (result) {
                    history.back();
                } else {
                    alert(error);
                }
            });
        } else {
            $('#disposisiModal').modal('show');
        }
    },
    // 'click #save'(e, t) {
    //     e.preventDefault();
    //     const proposalId = t.proposalId.get();
    //     const status = 1;
    //     const dispositionContent = $('#dispotitionContent').val();

    //     const data = {
    //         proposalId,
    //         status,
    //         dispositionContent
    //     };

    //     Meteor.call('update.statusProposal', data, function (error, result) {
    //         if (result) {
    //             location.reload();
    //         } else {
    //             alert(error);
    //         }
    //     });
    // },
    // 'click #save-reject'(e, t) {
    //     e.preventDefault();
    //     const proposalId = t.proposalId.get();
    //     const rejectContent = $('#rejectContent').val();


    //     const status = 90;
    //     const data = {
    //         proposalId,
    //         status,
    //         rejectContent
    //     };

    //     Meteor.call("update.statusProposal", data, function (error, result) {
    //         if (result) {
    //             location.reload();
    //         } else {
    //             alert(error);
    //         }
    //     });
    // },
    "click #btn-tolak"(e, t) {
        e.preventDefault();
        const proposalId = $(e.target).attr("milik");
        t.proposalId.set(proposalId);
        $('#rejectModal').modal('show');
        //update status surat dilihat
        //kode untuk melihat adalah 2

    },
    "click #filter"(e, t) {
        // e.preventDefault();
        const schools = $("#select-school").val();
        t.selectedSchools.set(schools);
    },
    "click #filter-clear"(e, t) {
        // e.preventDefault();
        $("#select-school").val("");
        $("#select-school").trigger('change.select2');
        t.selectedSchools.set(null);
    },
    "click #btn-kirim"(e, t) {
        e.preventDefault();
        Swal.fire({
            title: "Konfirmasi Kirim Proposal",
            text: "Apakah anda yakin mengirim proposal",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                const proposalId = $(e.target).attr("milik");
                const status = 0;
                const data = {
                    proposalId,
                    status,
                };
                const userId = Meteor.userId();

                Meteor.call("sentProposal", data, userId, function (error, result) {
                    console.log(result);
                    if (result) {
                        Swal.fire({
                            title: "Berhasil",
                            text: "Proposal berhasil dikirim",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        });
                        location.reload()
                    } else {
                        console.log(error);
                        alert("Pastikan semua field terisi");
                    }
                });
            }
        })
        
    },
    "click #createKosong": function (e, t) {

        Meteor.call("proposal.createKosong", function (error, result) {
            console.log(result);
            if (result) {
                FlowRouter.go("/proposal/create/" + result);
            }
        })
    },

});

Template.formProposal.onCreated(function () {
    // initEditor(Template.instance())
    const self = this;
    startSelect2();
    this.editorNeeds = new ReactiveVar();
    this.editorBackground = new ReactiveVar();
    this.editorPurpose = new ReactiveVar();
    this.editorTarget = new ReactiveVar();
    this.editorIndicator = new ReactiveVar();
    this.editorModel = new ReactiveVar();
    this.editorScheduleEvents = new ReactiveVar();
    this.editorTimeline = new ReactiveVar();
    this.editorTim = new ReactiveVar();
    this.editorFinance = new ReactiveVar();
    this.editorClose = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);
    this.nowListing = new ReactiveVar(0);
    self.dispositions = new ReactiveVar();
    self.daftarAlur = new ReactiveVar([]);
    self.daftarPegawaiAlur = new ReactiveVar([]);
    console.log(self.daftarAlur);
    //set up ck editor untuk semua form
    this.optionsNeeds = {
        editorEl: "editorNeeds",
        toolbarEl: "toolbar-containerNeeds",
        templateField: "editorNeeds"
    };
    this.optionsBackground = {
        editorEl: "editorBackground",
        toolbarEl: "toolbar-containerBackground",
        templateField: "editorBackground"
    };
    this.optionsPurpose = {
        editorEl: "editorPurpose",
        toolbarEl: "toolbar-containerPurpose",
        templateField: "editorPurpose"
    };
    this.optionsTarget = {
        editorEl: "editorTarget",
        toolbarEl: "toolbar-containerTarget",
        templateField: "editorTarget"
    };
    this.optionsIndicator = {
        editorEl: "editorIndicator",
        toolbarEl: "toolbar-containerIndicator",
        templateField: "editorIndicator"
    };
    this.optionsModel = {
        editorEl: "editorModel",
        toolbarEl: "toolbar-containerModel",
        templateField: "editorModel"
    };
    this.optionsScheduleEvents = {
        editorEl: "editorScheduleEvents",
        toolbarEl: "toolbar-containerScheduleEvents",
        templateField: "editorScheduleEvents"
    };
    this.optionsTimeline = {
        editorEl: "editorTimeline",
        toolbarEl: "toolbar-containerTimeline",
        templateField: "editorTimeline"
    };
    this.optionsTim = {
        editorEl: "editorTim",
        toolbarEl: "toolbar-containerTim",
        templateField: "editorTim"
    };
    this.optionsFinance = {
        editorEl: "editorFinance",
        toolbarEl: "toolbar-containerFinance",
        templateField: "editorFinance"
    };
    this.optionsClose = {
        editorEl: "editorClose",
        toolbarEl: "toolbar-containerClose",
        templateField: "editorClose"
    };

    Meteor.call('getDispositionsConfig', function (error, result) {
        if (result) {
            self.dispositions.set(result);
        } else {
            //(error);
        }
    });

    Tracker.autorun(() => {

        Meteor.subscribe("generalPicList", function () {
            //("generalPicList is ready");
        });

    });

    self.divisionList = new ReactiveVar();

    const thisUser = Meteor.user();
    if (Roles.userIsInRole(thisUser, ['superadmin'])) {
        Meteor.call('getDivisions', function (error, result) {
            if (result) {
                // //(result);
                self.divisionList.set(result)
            }
        });
    } else {

        Meteor.call('getDivisionsById', function (error, result) {
            if (result) {
                // //(result);
                self.divisionList.set(result)
            }
        });
    }
    //number of latters
    this.numberOfLetter = new ReactiveVar();

    self.deadlineProposal = new ReactiveVar();

    Meteor.call("proposalDeadline", function (error, result) {
        if (!error) {
            console.log(result);
            self.deadlineProposal.set(result)
        } else {
            console.log("data tidak ada");
        }
    })

    Meteor.call("users.getAll", function (error, result) {
        if (!error) {
            console.log(result);
            self.daftarPegawaiAlur.set(result)
        }
        else {
            console.log("data tidak ada");
        }
    })

});

Template.formProposal.events({
    "click .btn-remove"(e, t) {
        e.preventDefault()
        const index = $(e.target).attr("posisi");
        let dataAlur = t.daftarAlur.get();
        console.log(index, dataAlur);
        if(index != undefined) {
            dataAlur.splice(index, 1);
        }
        t.daftarAlur.set(dataAlur);
    },
    "click #submit"(e, t) {
        e.preventDefault();
        Swal.fire({
            title: "Konfirmasi Buat Proposal",
            text: "Apakah anda yakin ingin membuat proposal",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                const context = this;
                let status = -1;
                // if (context.submitType === 2) {
                //     status = 0
                // }
                // else{
                //     status = -1
                // }
        
                const name = $('#name').val();
                const backgroundsDescription = t.editorBackground.get().getData();
                const purposeDescription = t.editorPurpose.get().getData();
                const timeline = t.editorTimeline.get().getData();
                const fundingRequirementDescription = t.editorFinance.get().getData();
                const closeDescription = t.editorClose.get().getData();
                const dataAlur = t.daftarAlur.get();
                console.log(dataAlur);
                console.log(name, backgroundsDescription, purposeDescription, timeline, fundingRequirementDescription, closeDescription);
                let flag = true;
                if (!name.length) {
                    flag = false;
                    alert('Silahkan isi nama proposal')
                }
                if(!dataAlur.length) {
                    flag = false;
                    alert('Silahkan pilih alur')
                }
        
                const data = {
                    name,
                    backgroundsDescription,
                    purposeDescription,
                    timeline,
                    fundingRequirementDescription,
                    closeDescription,
                    alur: dataAlur,
                    status
                }
                
                data.id = FlowRouter.current().params._id;
                postRoute = 'createProposal';
        
                if (flag == true) {
                    Meteor.call(postRoute, data, function (error, result) {
                        if (result) {
                            Swal.fire({
                                title: "Berhasil",
                                text: "Proposal berhasil dibuat atau diupdate",
                                showConfirmButton: true,
                                allowOutsideClick: true,
                            });
                            history.back();
                        }
                        else {
                            console.log(error);
                        }
                    })
                }
                else {
                    Swal.close();
                }
            }
        }) 

    },
    'click #btn-add-alur'(e, t){
        e.preventDefault();
        const dataRow = t.daftarAlur.get();
        const selectedAlur = $("#input_alur").val();
        Swal.fire({
            title: "Konfirmasi Tambah Alur",
            text: "Apakah anda yakin menambah " + selectedAlur + " kedalam alur?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                if(selectedAlur.length > 0){
                    for (let index = 0; index < selectedAlur.length; index++) {
                        const element = selectedAlur[index];
                        dataRow.push(element);
                    }
                    
                }
                console.log(dataRow);
                t.daftarAlur.set(dataRow);
            }
        })
    },
});

Template.formProposal.onRendered(function () {
    const context = this;
    console.log(context.submitType.get());
    if (context.submitType.get() === 2) {
        const template = Template.instance();
        const id = FlowRouter.current().params._id
        let dataAlur;
        Meteor.call('getProposalById', id, function (error, result) {
            // console.log("result get proposal by id : ", result, error);
            if(result.flows) {
                dataAlur = result.flows;
                //hapus index pertama
                dataAlur.shift();
                //
                const dataAlurEdit = [];
                //role
                // dataAlur.map((x)=>dataAlurEdit.push(x.role))
                //user
                dataAlur.map((x)=>dataAlurEdit.push(x.username))
                context.daftarAlur.set(dataAlurEdit);
            }
            if (result) {
                $('#name').val(result.name);
                // $('#categoryProposal').val(result.dispositionId)
                context.optionsNeeds.content = result.needsDescription;
                context.optionsBackground.content = result.backgroundsDescription;
                context.optionsPurpose.content = result.purposeDescription;
                context.optionsTarget.content = result.participantsDescription;
                context.optionsIndicator.content = result.successIndicator;
                context.optionsModel.content = result.activityModel;
                context.optionsScheduleEvents.content = result.scheduleEvents;
                context.optionsTimeline.content = result.timeline;
                context.optionsTim.content = result.committee;
                context.optionsFinance.content = result.fundingRequirementDescription;
                context.optionsClose.content = result.closeDescription;

                initEditor(template, context.optionsNeeds);
                initEditor(template, context.optionsBackground);
                initEditor(template, context.optionsPurpose);
                initEditor(template, context.optionsTarget);
                initEditor(template, context.optionsIndicator);
                initEditor(template, context.optionsModel);
                initEditor(template, context.optionsScheduleEvents);
                initEditor(template, context.optionsTimeline);
                initEditor(template, context.optionsTim);
                initEditor(template, context.optionsFinance);
                initEditor(template, context.optionsClose);
            }
        });

    } else {
        console.log("masuk sini");
        initEditor(Template.instance(), this.optionsNeeds);
        initEditor(Template.instance(), this.optionsBackground);
        initEditor(Template.instance(), this.optionsPurpose);
        initEditor(Template.instance(), this.optionsTarget);
        initEditor(Template.instance(), this.optionsIndicator);
        initEditor(Template.instance(), this.optionsModel);
        initEditor(Template.instance(), this.optionsScheduleEvents);
        initEditor(Template.instance(), this.optionsTimeline);
        initEditor(Template.instance(), this.optionsTim);
        initEditor(Template.instance(), this.optionsFinance);
        initEditor(Template.instance(), this.optionsClose);
    }



    let urutan = 0;
    // jangan lupa nyalakan kembali sistem autosave nya
    setInterval(function () {
        // console.log("masuk");
        // console.log($('#name').val());
        //this user
        const thisUser = Meteor.user();
        const idPembuat = thisUser._id;
        //get data
        const name = $('#name').val();
        // const needsDescription = context.editorNeeds.get().getData();
        const backgroundsDescription = context.editorBackground.get().getData();
        const purposeDescription = context.editorPurpose.get().getData();
        // const participantsDescription = context.editorTarget.get().getData();
        // const successIndicator = context.editorIndicator.get().getData();
        // const activityModel = context.editorModel.get().getData();
        // const scheduleEvents = context.editorScheduleEvents.get().getData();
        const timeline = context.editorTimeline.get().getData();
        // const committee = context.editorTim.get().getData();
        const fundingRequirementDescription = context.editorFinance.get().getData();
        const closeDescription = context.editorClose.get().getData();

        console.log(name, backgroundsDescription, timeline, fundingRequirementDescription, closeDescription);

        //disposition id
        // const dispositionId = $('#categoryProposal').val();
        let flag = true;

        if (urutan > 0) {
            if (!name.length) {
                flag = false;
                alert('Silahkan isi nama proposal')
            }
        }

        const data = {
            name,
            backgroundsDescription,
            purposeDescription,
            timeline,
            fundingRequirementDescription,
            closeDescription,
        }

        data.id = FlowRouter.current().params._id;
        postRoute = 'createProposal';
        if (flag == true) {
            Meteor.call(postRoute, data, function (error, result) {
                if (result) {
                    //(result)
                }
            })
        }
        urutan++
    }, 30000)


});

Template.formProposal.helpers({
    divisions: function () {
        //(Template.instance().divisionList.get());
        return Template.instance().divisionList.get();
    },
    dateNow() {
        return Template.instance().deadlineProposal.get();
    },
    externalRecipients: function () {
        return ExternalRecipients;
    },
    categoryLetters: function () {
        return categoryLetters;
    },
    letterData: function () {
        return Template.instance().letterData.get();
    },
    numberOfLetter: function () {
        let division = 'Kode Bidang';
        let externalRecipient = 'Kode Unit';

        const divisionsData = Template.instance().divisions.get();
        const externalRecipientsData = Template.instance().externalRecipients.get();

        if (divisionsData) {
            division = divisionsData
        }
        if (externalRecipientsData) {
            externalRecipient = externalRecipientsData
        }

        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const number = numberOfDivisionLetter + '/YG/PWKI-SBY/' + division + '.' + externalRecipient + '/' + month + '.' + year;
        return number;
    },
    // categoryProposal: function () {
    //     const thisUser = Meteor.user();
    //     let type = 'kantor';
    //     if (Roles.userIsInRole(thisUser, ['teacher', 'headmaster'])) {
    //         type = 'sekolah';
    //     }
    //     const dispositionsData = Template.instance().dispositions.get();
    //     const filterDisposition = _.filter(dispositionsData, {
    //         'type': type
    //     });
    //     return filterDisposition;
    // },
    nowListing() {
        return Template.instance().nowListing.get();
    },
    daftarAlur(){
        return Template.instance().daftarAlur.get();
    },
    daftarPegawaiAlur(){
        return Template.instance().daftarPegawaiAlur.get();
    }
})

Template.previewProposal.onCreated(function () {
    const self = this;
    self.proposalId = new ReactiveVar();
    self.formSubmit = new ReactiveVar(0);
    self.jabatanLogin = new ReactiveVar();
    self.usernameLogin = new ReactiveVar();
    self.jabatanPembuat = new ReactiveVar();
    self.usernamePembuat = new ReactiveVar();
    self.isChief = new ReactiveVar(false);
    const id = FlowRouter.current().params._id;
    self.proposalData = new ReactiveVar();
    Meteor.call('getProposalById', id, function (error, result) {
        if (result) {
            self.proposalData.set(result)
        }
        else {
            console.log(error);
        }
    });

});

Template.previewProposal.helpers({
    proposalData: function () {
        return Template.instance().proposalData.get();
    },
    formSubmit: function () {
        return Template.instance().formSubmit.get();
    },
    statusRevisi: function () {
        const data = Template.instance().letterData.get();
        const approval1 = data.approval1;
        const approval2 = data.approval2;

        let statusRevisi = 1;
        if (approval2.status == 1) {
            statusRevisi = 0;
        }
        return statusRevisi;
    },
    jabatanLogin(){
        return Template.instance().jabatanLogin.get();
    },

    usernameLogin() {
        return Template.instance().usernameLogin.get();
    },

    //roles
    jabatanPembuat(){
        return Template.instance().jabatanPembuat.get();
    },
    //user
    usernamePembuat() {
        return Template.instance().usernamePembuat.get();
    },

    //roles
    // isPodo(){
    //     return Template.instance().jabatanPembuat.get() == Template.instance().jabatanLogin.get();
    // },

    //user
    isPodo(){
        return Template.instance().usernamePembuat.get() == Template.instance().usernameLogin.get();
    },
    isChief(){
        return Template.instance().isChief.get();
    }
});

Template.previewProposal.events({
    'click #btn-revisi': function (e, t) {
        t.formSubmit.set(1);
    },
    'click #revisi-save': function (e, t) {
        Swal.fire({
            title: "Konfirmasi Revisi",
            text: "Apakah anda yakin ingin menetapkan proposal harus direvisi",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                const note = $('#note').val();
                const letterId = FlowRouter.current().params._id;
                const status = 90;
        
                const data = {
                    note,
                    letterId,
                    status
                }
                Meteor.call('update.revisionProposal', data, function (error, result) {
                    console.log(result, error);
                    if (result) {
                        history.back();
                    } else {
                        alert('gagal update');
                    }
                })
            }
        })

    },
    "click #btn-approve"(e, t) {
        t.formSubmit.set(2);
    },
    "click #btn-proposal-setuju"(e, t){
        e.preventDefault();
        Swal.fire({
            title: "Konfirmasi Setuju",
            text: "Apakah anda yakin untuk menyetujui proposal",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                const thisUser = Meteor.user();
                const proposalId = FlowRouter.current().params._id;
                const status = 1;
                const dispositionContent = $('#note').val();
        
                const data = {
                    proposalId,
                    dispositionContent,
                    status
                };
                Meteor.call('update.statusProposal', data, function (error, result) {
                    if (result) {
                        history.back();
                    } else {
                        alert(error);
                    }
                });
            }
        })
    },
    "click #btn-disapprove"(e, t){
        t.formSubmit.set(3);
    },
    "click #btn-proposal-tolak"(e, t){
        e.preventDefault();
        Swal.fire({
            title: "Konfirmasi Tolak",
            text: "Apakah anda yakin untuk menolak proposal",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                const thisUser = Meteor.user();
                const proposalId = FlowRouter.current().params._id;
                const status = 99;
                const dispositionContent = $('#note').val();
        
                const data = {
                    proposalId,
                    dispositionContent,
                    status
                };
                Meteor.call('update.statusProposalTolak', data, function (error, result) {
                    if (result) {
                        history.back();
                    } else {
                        alert(error);
                    }
                });
            }
        })
    }
});

Template.viewProposal.onCreated(function () {
    const self = this;

    self.proposalId = new ReactiveVar();
    self.formSubmit = new ReactiveVar(0);
    self.jabatanLogin = new ReactiveVar();
    self.jabatanPembuat = new ReactiveVar();
    self.isChief = new ReactiveVar(false);
    self.usernamePembuat = new ReactiveVar();
    const id = FlowRouter.current().params._id;
    self.proposalData = new ReactiveVar();
    Meteor.call('getProposalById', id, function (error, result) {
        if (result) {
            console.log(result);
            self.proposalData.set(result)
        }
        else {
            console.log(error);
        }
    });

});

Template.viewProposal.helpers({
    proposalData: function () {
        return Template.instance().proposalData.get();
    },
    formSubmit: function () {
        return Template.instance().formSubmit.get();
    },
    statusRevisi: function () {
        const data = Template.instance().letterData.get();
        const approval1 = data.approval1;
        const approval2 = data.approval2;

        let statusRevisi = 1;
        if (approval2.status == 1) {
            statusRevisi = 0;
        }
        return statusRevisi;
    },
    isChief(){
        return Template.instance().isChief.get();
    },
    usernamePembuat() {
        return Template.instance().usernamePembuat.get();
    }
    // jabatanLogin(){
    //     return Template.instance().jabatanLogin.get();
    // },
    // jabatanPembuat(){
    //     return Template.instance().jabatanPembuat.get();
    // },
    // isPodo(){
    //     return Template.instance().jabatanPembuat.get() == Template.instance().jabatanLogin.get();
    // }
});

Template.printProposal.onCreated(function () {
    const self = this;
    self.formSubmit = new ReactiveVar(0);
    self.isChief = new ReactiveVar(false);
    self.usernamePembuat = new ReactiveVar();
    const id = FlowRouter.current().params._id;
    // //('prev '+ id);
    self.proposalData = new ReactiveVar();
    const thisUser = Meteor.userId();
    Meteor.call('getProposalById', id, function (error, result) {
        if (result) {
            //("result");
            //(result);
            self.proposalData.set(result)
        }
        else {
            console.log(error);
        }
    });
});

Template.printProposal.helpers({
    proposalData: function () {
        return Template.instance().proposalData.get();
    },
    formSubmit: function () {
        //(Template.instance().formSubmit.get());
        return Template.instance().formSubmit.get();
    },
    statusRevisi: function () {
        const data = Template.instance().letterData.get();
        const approval1 = data.approval1;
        const approval2 = data.approval2;

        let statusRevisi = 1;
        if (approval2.status == 1) {
            statusRevisi = 0;
        }
        //(statusRevisi);
        return statusRevisi;
    },
    dateNow: function () {
        return new Date();
    },
    praeses: function () {
        const praeses = Meteor.users.findOne({
            "roles": "praeses"
        });
        return praeses
    },
    isChief(){
        return Template.instance().isChief.get();
    },
    usernamePembuat() {
        return Template.instance().usernamePembuat.get();
    }
});

Template.printProposal.events({
    "click #klikini": function (event, template) {
        var element = document.getElementById("test");

        let paramId = FlowRouter.current().params._id;
        if (!paramId) {
            paramId = Meteor.userId();
        }
        const currentProposal = Template.instance().proposalData.get();

        var opt = {
            margin: 0.5,
            filename: currentProposal.name + ".pdf",
            enableLinks: false,
            // pagebreak: { mode: "avoid-all" },
            image: {
                type: "jpeg",
                quality: 0.98
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: "in",
                format: "A4",
                orientation: "portrait"
            },
        };

        html2pdf()
            .from(element)
            .set(opt)
            .toPdf()
            .get("pdf")
            .then(function (pdf) {
                //(pdf);
                var totalPages = pdf.internal.getNumberOfPages();
                for (var i = 1; i <= totalPages; i++) {
                    // pdf.addHTML(element);
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                }
            })
            .save();
    },
});

Template.createLPJProposal.onCreated(function () {
    const self = this;
    self.rincian = new ReactiveVar([]);
    self.total = new ReactiveVar(0);
    self.buktiPembayaran = new ReactiveVar([]);
    self.buktiDokumentasi = new ReactiveVar([]);
    self.allFileNames = new ReactiveVar([]);
    self[`template-field-deskripsi`] = new ReactiveVar();
    Meteor.call('fileName.getAll', function(error, result) {
        if (error) {
            console.log(error);
        } else {
            self.allFileNames.set(result)
        }
    })
    setTimeout(() => {
        initEditor(self, 
            {
                editorEl: `editor-deskripsi`, 
                toolbarEl: `toolbar-container-deskripsi`,
                templateField: `template-field-deskripsi`,
            })
    }, 300);
});

Template.createLPJProposal.helpers({
    rincian() {
        return Template.instance().rincian.get()
    },
    total() {
        return Template.instance().total.get()
    },
    buktiPembayaran() {
        return Template.instance().buktiPembayaran.get()
    },
    buktiDokumentasi() {
        return Template.instance().buktiDokumentasi.get()
    },
    allFileNames() {
        return Template.instance().allFileNames.get();
    },
});

Template.createLPJProposal.events({
    "keyup #nominal"(e, t) {
        const idInput = $("#nominal").val();
        e.target.value = formatRupiah(idInput, "Rp. ");
    },
    "click #btn-tambah-detail"(e, t) {
        const rincian = t.rincian.get()
        console.log(rincian);
        const name = $("#keterangan").val();
        let amount = convert2number($("#nominal").val());
        let total = t.total.get();
        total += amount
        console.log(name, amount);
        const obj = {
            name: name,
            amount: amount
        }
        rincian.push(obj);
        t.rincian.set(rincian);
        console.log(t.rincian.get());
        t.total.set(total);
    },
    "click .btn-remove"(e, t) {
        const index = parseInt($(e.target).attr("milik"));
        let rincian = t.rincian.get();
        let total = t.total.get();
        if(index != undefined) {
            total -= rincian[index].amount
            t.total.set(total);
            rincian.splice(index, 1);
            t.rincian.set(rincian);
        }
        console.log(rincian);
    },
    "change #buktiPembayaran": function (e, t) {
        const buktiPembayaran = t.buktiPembayaran.get();
        const files = $("#buktiPembayaran").prop("files");
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          if (file) {
          const reader = new FileReader();
          const body = {
            file: file,
          };
          reader.addEventListener("load", function () {
            body.src = this.result;
            if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc" || 
                    file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
            $(`#buktiPembayaran-${buktiPembayaran.length - 1}`).attr(
              "href",
              this.result
            );
            }
          });
          reader.readAsDataURL(file);
          buktiPembayaran.push(body);
          t.buktiPembayaran.set(buktiPembayaran);
          }
        }
    },
    "click .remove-buktiPembayaran": function (e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        const buktiPembayaran = t.buktiPembayaran.get();
        buktiPembayaran.splice(parseInt(index), 1);
        t.buktiPembayaran.set(buktiPembayaran);
    },
    "change #buktiDokumentasi": function (e, t) {
        const buktiDokumentasi = t.buktiDokumentasi.get();
        const files = $("#buktiDokumentasi").prop("files");
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          if (file) {
          const reader = new FileReader();
          const body = {
            file: file,
          };
          reader.addEventListener("load", function () {
            body.src = this.result;
            if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc" || 
                    file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
            $(`#buktiDokumentasi-${buktiDokumentasi.length - 1}`).attr(
              "href",
              this.result
            );
            }
          });
          reader.readAsDataURL(file);
          buktiDokumentasi.push(body);
          t.buktiDokumentasi.set(buktiDokumentasi);
          }
        }
    },
    "click .remove-buktiDokumentasi": function (e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        const buktiDokumentasi = t.buktiDokumentasi.get();
        buktiDokumentasi.splice(parseInt(index), 1);
        t.buktiDokumentasi.set(buktiDokumentasi);
    },
    "click #btn-save"(e, t) {
        e.preventDefault()
        const nameActivity = $("#namaKegiatan").val();
        const dateActivity = $("#tanggalKegiatan").val();
        const placeActivity = $("#tempatKegiatan").val();
        const deskripsi = t[`template-field-deskripsi`].get().getData();
        const rincian = t.rincian.get();
        const totalRincian = t.total.get();
        const filesTransaction = t.buktiPembayaran.get();
        const filesActivity = t.buktiDokumentasi.get();
        const thisForm = {};
        const thisForm1 = {};
        thisForm[filesTransaction] = [];
        thisForm1[filesActivity] = [];
        const allFileNames = t.allFileNames.get();
        const idProposal = FlowRouter.getParam("_id");

        Swal.fire({
            title: "Konfirmasi",
            text: "Apakah anda ingin menyimpan data ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal"
          }).then(async (result) => {
            if(result.isConfirmed){
              Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                showConfirmButton: false,
                onBeforeOpen: () => {
                  Swal.showLoading();
                },
              });
              const dataForm = $(".form-control")
              let cek = false;
              for (let index = 0; index < dataForm.length; index++) {
                console.log(dataForm[index].id);
                if(dataForm[index].value == ""){
                  cek = true;
                }
              }
      
              if(cek == true){
                Swal.close();
                Swal.fire({
                  title: "Gagal",
                  text: "Data harus diisi semua",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
              else{
                for (let index = 0; index < filesTransaction.length; index++) {
                  const fileName = filesTransaction[index].file.name;
                  const sendFileName = checkDuplicateFileName(fileName, allFileNames);
                  const uploadData = {
                    fileName: "kepegawaian/"+sendFileName,
                    type: "image/png",
                    Body: filesTransaction[index].file
                  }
                  console.log(uploadData);
                  const linkUpload = await uploadFiles(uploadData);
                  thisForm[filesTransaction].push(
                  {
                    name: filesTransaction[index].file.name,
                    link: linkUpload
                  });
                }

                for (let index = 0; index < filesActivity.length; index++) {
                    const fileName = filesActivity[index].file.name;
                    const sendFileName = checkDuplicateFileName(fileName, allFileNames);
                    const uploadData = {
                      fileName: "kepegawaian/"+sendFileName,
                      type: "image/png",
                      Body: filesActivity[index].file
                    }
                    console.log(uploadData);
                    const linkUpload = await uploadFiles(uploadData);
                    thisForm1[filesActivity].push(
                    {
                      name: filesActivity[index].file.name,
                      link: linkUpload
                    });
                }

                const data = {
                    name: nameActivity,
                    timestamp: dateActivity,
                    place: placeActivity,
                    description: deskripsi,
                    detailTransaction: rincian,
                    totalTransaction: totalRincian,
                    linksTransaction: thisForm[filesTransaction],
                    linksActivity: thisForm1[filesActivity]
                }
                Meteor.call(
                  "proposalReport.create",
                  data, idProposal,
                  function (error, result) {
                    if (result) {
                      Swal.close();
                      Swal.fire({
                        title: "Berhasil",
                        text: "Data berhasil dibuat",
                        showConfirmButton: true,
                        allowOutsideClick: true,
                      });
                      location.reload();
                      history.back();
                    } else {
                      console.log(error);
                      Swal.close();
                      Swal.fire({
                        title: "Gagal",
                        text: error.reason,
                        showConfirmButton: true,
                        allowOutsideClick: true,
                      });
                    }
                  }
                );
              }
            }
        })
    }
})

Template.detailLPJProposal.onCreated(function () {
    const self = this;
    self.dataLPJ = new ReactiveVar();
    const id = FlowRouter.getParam("_id")
    Meteor.call('proposalReport.detail', id, function(error, result) {
        if (error) {
            console.log(error);
        } else {
            self.dataLPJ.set(result)
        }
    })
})

Template.detailLPJProposal.helpers({
    dataLPJ() {
        return Template.instance().dataLPJ.get()
    },
})


function formatRupiah(angka, prefix) {
    var number_string = angka.replace(/[^,\d]/g, "").toString(),
      split = number_string.split(","),
      sisa = split[0].length % 3,
      rupiah = split[0].substr(0, sisa),
      ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  
    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
      separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
  
    rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
    console.log(rupiah);
    return rupiah;
}

function convert2number(data) {
    let temp = data.replace(/\./g, ''); // merubah . jadi ""
    return parseFloat(temp);
}

function checkDuplicateFileName(fileName, allFileNames) {
	const result = allFileNames;
	if(result.length == 0 || result == undefined){
		return fileName;
	}
	for (let i = 0; i < result.length; i++) {
		const element = result[i];
		const randomString = generateRandomString(5)
		if(fileName == element){
			const finalName = addRandomString(fileName, randomString)
			console.log(finalName);
			return finalName;
		}
		else{
			return fileName;
		}
	}
}

function generateRandomString(length) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let randomString = "";
  
	for (let i = 0; i < length; i++) {
	  const randomIndex = Math.floor(Math.random() * charset.length);
	  randomString += charset.charAt(randomIndex);
	}
	return randomString;
}

function addRandomString(inputString, appendString){
	const lastDotIndex = inputString.lastIndexOf('.');

  if (lastDotIndex !== -1) {
    // If a dot is found, insert the appendString before the last dot
    const modifiedString = inputString.substring(0, lastDotIndex) + '-' + appendString + inputString.substring(lastDotIndex);
    return modifiedString;
  } else {
    // If no dot is found, simply concatenate the appendString to the original string
    return inputString + '|' + appendString;
  }
}