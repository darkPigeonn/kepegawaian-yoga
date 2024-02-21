import "./forms.html";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


Template.formLecturers.onCreated(function () {
    this.formPage = new ReactiveVar(1);
    this.formData = new ReactiveVar({});
    this.listExperiences = new ReactiveVar([])
    this.listEducationalHistory = new ReactiveVar([])
    this.listCertification = new ReactiveVar([])
    this.submitType = new ReactiveVar()
});

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
        const graduateDegree = $("#inputGraduateDegree").val()
        const domesticStatus = $("#inputDomestic").val()
        const formalStatus = $("#inputFormalStatus").val()
        const dateStart = $("#inputEducationStart").val()
        const dateEnd = $("#inputEducationEnd").val()

        const data = {
            educationLevel,
            major,
            institution,
            graduateDegree,
            domesticStatus,
            formalStatus,
            dateStart,
            dateEnd
        }

        listEducationalHistory.push(data)
        t.listEducationalHistory.set(listEducationalHistory)
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
        const formData = t.formData.get()
        const getValue = $(e.target).val();
        if (getValue == 2){
            formData.username = $("#inputUsername").val()
            formData.fullName = $("#inputFullname").val()
            formData.address = $("#inputAddress").val()
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
        const getValue = $(e.target).val();
        t.formPage.set(getValue);
    },
    async 'click #btn-submit' (e, t){
        e.preventDefault()
        const submitType = t.submitType.get()
        const researchInterest = $("#inputResearchInterest").val()
        const formData = t.formData.get()
        const listCertification = t.listCertification.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listExperiences = t.listExperiences.get()

        console.log(formData)
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