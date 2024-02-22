import "./forms.html";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


Template.formLecturers.onCreated(function () {
    const self = this;
    self.formPage = new ReactiveVar(1);
    self.formData = new ReactiveVar({});
    self.listExperiences = new ReactiveVar([])
    self.listEducationalHistory = new ReactiveVar([])
    self.listCertification = new ReactiveVar([])
    self.submitType = new ReactiveVar(self.data.submitType)
});

Template.formLecturers.onRendered( function(){
    const context = Template.instance();
    if (this.submitType.get() === 2) {
        const id = FlowRouter.getParam("_id")
        Meteor.call("dosen.getDetails", id, function (err, res) {
            if (err) {
                history.back();
            } else {
                context.formData.set(res)
                context.listExperiences.set(res.listExperiences)
                context.listEducationalHistory.set(res.listEducationalHistory)
                context.listCertification.set(res.listCertification)
            }
        });
    }
})

Template.formLecturers.helpers({
    formPage(){
        return Template.instance().formPage.get();
    },
    formData(){
        return Template.instance().formData.get()
    },
    listExperiences(){
        return Template.instance().listExperiences.get()
    },
    listEducationalHistory(){
        return Template.instance().listEducationalHistory.get()
    },
    listCertification(){
        return Template.instance().listCertification.get()
    }
});

Template.formLecturers.events({
    "click #add-history" (e, t){
        e.preventDefault()
        const listEducationalHistory = t.listEducationalHistory.get()
        const educationLevel = $("#inputEducationLevel").val()
        const major = $("#inputEducationMajor").val()
        const institution = $("#inputEducationInstitution").val()
        const domesticStatus = $("#inputDomestic").val()
        const graduateDegree = $("#inputGraduateDegree").val()
        const studyPublication = $("#inputStudyPublication").val()
        const formalStatus = $("#inputFormalStatus").val()
        const dateStart = $("#inputEducationStart").val()
        const dateEnd = $("#inputEducationEnd").val()

        const data = {
            educationLevel,
            major,
            institution,
            domesticStatus,
            graduateDegree,
            studyPublication,
            formalStatus,
            dateStart,
            dateEnd
        }

        listEducationalHistory.push(data)
        t.listEducationalHistory.set(listEducationalHistory)
        // console.log(t.listEducationalHistory.get());
    },
    "click .add-certification" (e, t){
        e.preventDefault()
        const listCertification = t.listCertification.get()
        const type = $("#inputCertificationType").val()
        const major = $("#inputCertificationMajor").val()
        const registrationNumber = $("#inputRegistrationNumber").val()
        const skNumber = $("#inputSkNumber").val()
        const organizer = $("#inputCertificationOrganiser").val()
        const grade = $("#inputCertificationGrade").val()
        const dateStart = $("#inputCertificationStart").val()
        const dateEnd = $("#inputCertificationEnd").val()

        const data = {
            type,
            major,
            registrationNumber,
            skNumber,
            organizer,
            grade,
            dateStart,
            dateEnd
        }

        listCertification.push(data)
        t.listCertification.set(listCertification)
        // console.log(t.listCertification.get());
    },
    "click #add-experience" (e, t){
        e.preventDefault()
        const listExperiences = t.listExperiences.get()
        const textArea = $("#inputListExperience").val()
        const jobPosition = $("#inputJobPosition").val()
        const institution = $("#inputInstitution").val()
        const startDate = $("#inputStartDate").val()
        const endDate = $("#inputEndDate").val()
        const data = {
            jobPosition,
            institution,
            startDate,
            endDate
        }
        listExperiences.push(data)
        t.listExperiences.set(listExperiences)
    },
    'click .btnNavigation' (e, t){
        e.preventDefault()
        const getValue = $(e.target).attr('data-value');
        t.formPage.set(getValue);
    },
    'click .btn-next' (e, t){
        e.preventDefault()
        const formData = t.formData.get();
        // console.log(formData);
        const getValue = $(e.currentTarget).val();
        if (getValue == 2){
            formData.username = $("#inputUsername").val()
            formData.fullName = $("#inputFullname").val()
            formData.address = $("#inputAddress").val()
            formData.email = $("#inputEmail").val()
            formData.phoneNumber = $("#inputPhoneNumber").val()
            formData.pob = $("#inputPob").val()
            formData.dob = $("#inputDob").val()
            formData.gender = $("#inputGender").val()
            formData.nationality = $("#inputNationality").val()
            formData.religion = $("#inputReligion").val()
            formData.nik = $("#inputNik").val()
            formData.registeredAddress = $("#inputRegisteredAddress").val()
            formData.imageFile = $('#inputImageProfile')[0].files[0]
        } else if (getValue == 3){
            formData.nidn = $("#inputNidn").val()
            formData.position = $("#inputPosition").val()
            formData.academicRank = $("#inputAcademicRank").val()
            formData.listExperience = $("#inputListExperience").val()
        } else if (getValue == 4){
            formData.listEducationalHistory = $("#inputListHistory").val()
        } 
        t.formPage.set(getValue);
        t.formData.set(formData)
    },
    'click .btn-previous' (e, t){
        e.preventDefault()
        const getValue = $(e.currentTarget).val();
        t.formPage.set(getValue);
    },
    'click .btn-trash' (e, t) {
        
    },
    async 'click #btn-submit' (e, t){
        e.preventDefault()
        const submitType = t.submitType.get()
        const researchInterest = $("#inputResearchInterest").val()
        const formData = t.formData.get()
        const listCertification = t.listCertification.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listExperiences = t.listExperiences.get()

        // console.log(formData)
        formData.researchInterest = researchInterest
        formData.listCertification = listCertification
        formData.listEducationalHistory = listEducationalHistory
        formData.listExperiences = listExperiences

        if (formData.imageFile){
            const uploadData = {
                type: 'dosen-profilePics',
                Body: formData.imageFile
              };
              const fileLink = await uploadFiles(uploadData)
              formData.imageLink = fileLink
              delete formData.imageFile
        }
        let postRoute = "dosen.insert"
        if (submitType === 2){
            postRoute = "dosen.update"
            formData._id = FlowRouter.getParam("_id")
        }
        Meteor.call(postRoute, formData, async function (err, res) {
            if (err) {
              failAlert(err);
            } else {
              successAlert("Data berhasil disimpan");
              FlowRouter.go("/")
            }
        });
    }
});


  

  
  Template.passwordEdit.events({
    'click #editPassword' (e, t) {
      e.preventDefault();
      const old = $("#old-password").val()
      const newPassword = $("#new-password").val()
      const confirmation = $("#confirmation-password").val()

      if (old === "" || newPassword === "" || confirmation === "" ){
        failAlert("Pastikan semua Field terisi !")
      } else {
        if (newPassword !== confirmation){
            failAlert("Password baru dan konfirmasi password tidak sama !")
        } else {
            const data = {
                old,
                newPassword
            } 
            Meteor.call("users.changePassword", data, function (error, result) {
                if (error) {
                  failAlert(error)
                } else {
                  successAlert("Berhasil mengubah password")
                  FlowRouter.go("/")
                }
              });
        }
      }
    }
  })