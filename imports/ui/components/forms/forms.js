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
    self.pageMode = new ReactiveVar();
    self.skImage = new ReactiveVar(false)
    self.listKerjaPenugasan = new ReactiveVar([])
    self.listPengajaran = new ReactiveVar([])
    self.listBimbingan = new ReactiveVar([])
    const lecturerId = FlowRouter.getParam("_id");
    const mode = lecturerId ? "edit" : "add";
    self.pageMode.set(mode);
});

Template.formLecturers.onRendered( function(){
    const context = Template.instance();
    if (this.submitType.get() === 2) {
        const id = FlowRouter.getParam("_id")
        Meteor.call("dosen.getDetails", id, function (err, res) {
            if (err) {
                failAlert("Dosen Tidak Ditemukan!");
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
    listBimbingan(){
        return Template.instance().listBimbingan.get()
    },
    listPengajaran(){
        return Template.instance().listPengajaran.get()
    },
    listKerjaPenugasan(){
        return Template.instance().listKerjaPenugasan.get()
    },
    skImage(){
        return Template.instance().skImage.get()
    },
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
    },
    pageMode(){
        return Template.instance().pageMode.get();
    }
});

Template.formLecturers.events({
    "change #inputFileSk" (e, t){
        e.preventDefault();
        const file = e.target.files[0]
        if (file) {
          t.skImage.set(true)
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            $('#skImage').attr('src', this.result)
          });
          reader.readAsDataURL(file);
        }
        else {
          $('#skImage').attr('src', '#')
        }
    },
    'click #remove-sk' (e, t){
        e.preventDefault()
        $('#inputFileSk').attr('src', "")
        $("#inputFileSk").val("")
        t.skImage.set(false)
    },
    'change #inputImageProfile'(e, t) {
        e.preventDefault();
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            $('#inputImageProfile').attr('src', this.result)
            const formData = t.formData.get()
            formData.imageLink = this.result
            t.formData.set(formData)
          });
          reader.readAsDataURL(file);
        }
        else {
          $('#inputImageProfile').attr('src', '#')
        }
    },
    'click #remove-profile' (e, t){
        e.preventDefault()
        $('#inputImageProfile').attr('src', "")
        $("#inputImageProfile").val("")
        const formData = t.formData.get()
        delete formData.imageLink
        t.formData.set(formData)
    },
    "click #add-history" (e, t){
        e.preventDefault()
        const listEducationalHistory = t.listEducationalHistory.get()
        const educationLevel = $("#inputEducationLevel").val()
        const major = $("#inputEducationMajor").val()
        const institution = $("#inputEducationInstitution").val()
        const graduateDegree = $("#inputGraduateDegree").val()
        const studyPublication = $("#inputStudyPublication").val()
        const domesticStatus = $("input[name=inputDomestic]:checked").val()
        const formalStatus = $("input[name=inputFormalStatus]:checked").val()
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
    "click .add-pengajaran" (e, t){
        e.preventDefault()
        const listPengajaran = t.listPengajaran.get()
        const matkul = $("#inputMataKuliah").val()
        const ps = $("#input-ps").val()
        const type = $("#input-jenis").val()
        const bidangKeilmuan = $("#inputBidangKeilmuan").val()
        const mhsTotal = $("#inputJumlahMahasiswa").val()
        const sks = $("#inputSks").val()
        const data = {
            type,
            matkul,
            ps,
            bidangKeilmuan,
            mhsTotal,
            sks
        }
        // console.log(data)
        listPengajaran.push(data)
        t.listPengajaran.set(listPengajaran)
    },
    "click .add-bimbingan" (e, t){
        e.preventDefault()
        const listBimbingan = t.listBimbingan.get()
        const name = $("#inputName").val()
        const title = $("#inputJudul").val()
        const pembimbingCategory = $("#input-jenis-pembimbing").val()
        const bidangKeilmuan = $("#inputBidangKeilmuanPembimbing").val()
        const programStudi = $("#inputProgramStudi").val()
        const lembagaName = $("#inputNamaLembaga").val()
        const endDate = $("#inputTahun").val()
        const data = {
            name,
            title,
            pembimbingCategory,
            programStudi,
            bidangKeilmuan,
            lembagaName,
            endDate
        }
        // console.log(data)
        listBimbingan.push(data)
        t.listBimbingan.set(listBimbingan)
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
        const file = $("#inputFileSk").prop("files")[0]
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
        if (file) {
            data.skFile = file
        }
        // console.log(data)
        listCertification.push(data)
        t.listCertification.set(listCertification)

        if (file){
            const reader = new FileReader()
            reader.addEventListener('load', function () {
                $('.link-'+(listCertification.length-1) +"").attr('href', this.result)
            });
            reader.readAsDataURL(file);
        //   console.log(t.listCertification.get());
        }
      
    },
    "click .remove-list" (e, t){
        e.preventDefault()
        const index = $(e.target).data("milik")
        const identifier = $(e.target).data("id");
        const listExperiences = t.listExperiences.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listCertification = t.listCertification.get()
        const listKerjaPenugasan = t.listKerjaPenugasan.get()
        const listPengajaran = t.listPengajaran.get()
        const listBimbingan = t.listBimbingan.get()

        confirmationAlertAsync().then(async function (result) {
            if (result.value){
                if (identifier === "experiences"){
                    listExperiences.splice(index, 1)
                    t.listExperiences.set(listExperiences)
                } else if (identifier === "education"){
                    listEducationalHistory.splice(index, 1)
                    t.listEducationalHistory.set(listEducationalHistory)
                } else if (identifier === "certification") {
                    listCertification.splice(index, 1)
                    t.listCertification.set(listCertification)
                } else if (identifier === "kerjapenugasan" ) {
                    listKerjaPenugasan.splice(index, 1)
                    t.listKerjaPenugasan.set(listKerjaPenugasan)
                } else if (identifier === "pengajaran"){
                    listPengajaran.splice(index, 1)
                    t.listPengajaran.set(listPengajaran)
                } else if (identifier === "bimbingan"){
                    listBimbingan.splice(index, 1)
                    t.listBimbingan.set(listBimbingan)
                }
            }
        })
    },
    "click .add-kerjapenugasan"(e, t){
        e.preventDefault()
        const listKerjaPenugasan = t.listKerjaPenugasan.get()
        const name = $("#inputName").val()
        const place = $("#inputPlace").val()
        const period = $("#inputPeriod").val()
        const note = $("#inputNote").val()
        const data = {
            name,
            place,
            period,
            note
        }

        console.log(data)
        listKerjaPenugasan.push(data)
        t.listKerjaPenugasan.set(listKerjaPenugasan)
    },
    "click #add-experience" (e, t){
        e.preventDefault()
        const listExperiences = t.listExperiences.get()
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
        // console.log(t.listExperiences.get())
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
        console.log(getValue)
        if (getValue == 2){
            if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputEmail").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
                formData.username = $("#inputUsername").val();
                formData.fullName = $("#inputFullname").val();
                formData.address = $("#inputAddress").val();
                formData.email = $("#inputEmail").val();
                formData.phoneNumber = $("#inputPhoneNumber").val();
                formData.pob = $("#inputPob").val();
                formData.dob = $("#inputDob").val();
                formData.gender = $("input[name=inputGender]:checked").val();
                formData.nationality = $("#inputNationality").val();
                formData.religion = $("#inputReligion").val();
                formData.nik = $("#inputNik").val();
                formData.registeredAddress = $("#inputRegisteredAddress").val();
                formData.imageFile = $('#inputImageProfile')[0].files[0];
                t.formPage.set(getValue);
                t.formData.set(formData)
            } else {
                failAlert("Pastikan username, Nama, email, alamat, dan tempat lahir sudah diisi !")
            }
            
        } else if (getValue == 3){
            formData.nidn = $("#inputNidn").val()
            formData.position = $("#inputPosition").val()
            formData.academicRank = $("#inputAcademicRank").val()
            formData.listExperience = $("#inputListExperience").val()
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 4){
            formData.listEducationalHistory = $("#inputListHistory").val()
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 5){
            formData.researchInterest = $("#inputResearchInterest").val()
            t.formPage.set(getValue);
            t.formData.set(formData)
        }
        else if (getValue == 6){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 7){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 8){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 9){
            t.formPage.set(getValue);
            t.formData.set(formData)
        }
    },
    'click .btn-previous' (e, t){
        e.preventDefault()
        const getValue = $(e.currentTarget).val();
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

        confirmationAlertAsync().then(async function (result) {
            if (result.value) {
                formData.researchInterest = researchInterest
                formData.listCertification = listCertification
                formData.listEducationalHistory = listEducationalHistory
                formData.listExperiences = listExperiences

                // console.log(formData)

                if (formData.imageFile){
                    const uploadData = {
                        type: 'dosen-profilePics',
                        Body: formData.imageFile
                    };
                    const fileLink = await uploadFiles(uploadData)
                    formData.imageLink = fileLink
                    delete formData.imageFile
                }

                for (const iterator of formData.listCertification) {
                    // console.log(iterator)
                    if (iterator.skFile){
                        const uploadData = {
                            type: 'dosen-sk',
                            Body: iterator.skFile
                        };
                        const fileLink = await uploadFiles(uploadData)
                        iterator.fileLink = fileLink
                        delete iterator.skFile
                    }
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
    },
    async 'click .btn-personal' (e, t) {
        e.preventDefault()
        const formData = t.formData.get();
        const getValue = $(e.currentTarget).val();
        // 1 = data pribadi, 2 = identitas nasional, 3 = pengalaman profesi terbaru, 4 = pengalaman profesi sebelumnya, 5 = riwayat pendidikan, 6 = sertifikasi, 7 = bidang penelitian yang diminati
        confirmationAlertAsync().then(async function (result) {
            if (result.value) {
                if (getValue == 1){
                    if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputEmail").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
                        formData._id = FlowRouter.getParam("_id");
                        formData.username = $("#inputUsername").val();
                        formData.fullName = $("#inputFullname").val();
                        formData.address = $("#inputAddress").val();
                        formData.email = $("#inputEmail").val();
                        formData.phoneNumber = $("#inputPhoneNumber").val();
                        formData.pob = $("#inputPob").val();
                        formData.dob = $("#inputDob").val();
                        formData.gender = $("input[name=inputGender]:checked").val();
                        formData.imageFile = $('#inputImageProfile')[0].files[0];

                        if (formData.imageFile){
                            const uploadData = {
                                type: 'dosen-profilePics',
                                Body: formData.imageFile
                            };
                            const fileLink = await uploadFiles(uploadData)
                            formData.imageLink = fileLink
                            delete formData.imageFile
                        }
                    } 
                    else {
                        failAlert("Pastikan username, Nama, email, alamat, dan tempat lahir sudah diisi !");
                    }
                }
                else if(getValue == 2){
                    if ($("#inputNik").val() !== "" && $("#inputRegisteredAddress").val() !== "") {
                        formData._id = FlowRouter.getParam("_id");
                        formData.nationality = $("#inputNationality").val();
                        formData.religion = $("#inputReligion").val();
                        formData.nik = $("#inputNik").val();
                        formData.registeredAddress = $("#inputRegisteredAddress").val();
                    }
                    else{
                        failAlert("Pastikan semua field telah terisi !");
                    }
                }
                else if(getValue == 3){
                    if ($("#inputNidn").val() !== "" && $("#inputPosition").val() !== "" && $("#inputAcademicRank").val() !== "") {
                        formData._id = FlowRouter.getParam("_id")
                        formData.nidn = $("#inputNidn").val();
                        formData.position = $("#inputPosition").val();
                        formData.academicRank = $("#inputAcademicRank").val();
                    }
                    else{
                        failAlert("Pastikan semua field telah terisi !");
                    }
                }
                else if(getValue == 4){
                    formData._id = FlowRouter.getParam("_id");
                    const listExperiences = t.listExperiences.get();
                    formData.listExperiences = listExperiences;
                }
                else if(getValue == 5){
                    formData._id = FlowRouter.getParam("_id");
                    const listEducationalHistory = t.listEducationalHistory.get();
                    formData.listEducationalHistory = listEducationalHistory;
                }
                else if(getValue == 6){
                    formData._id = FlowRouter.getParam("_id");
                    const listCertification = t.listCertification.get();
                    formData.listCertification = listCertification;
                    for (const iterator of formData.listCertification) {
                        // console.log(iterator)
                        if (iterator.skFile){
                            const uploadData = {
                                type: 'dosen-sk',
                                Body: iterator.skFile
                            };
                            const fileLink = await uploadFiles(uploadData)
                            iterator.fileLink = fileLink
                            delete iterator.skFile
                        }
                    }
                }
                else if(getValue == 7){
                    formData._id = FlowRouter.getParam("_id");
                    const researchInterest = $("#inputResearchInterest").val();
                    formData.researchInterest = researchInterest;
                }

                Meteor.call("dosen.update", formData, async function (err, res) {
                    if (err) {
                        failAlert(err);
                    } else {
                        successAlert("Data berhasil diubah");
                        FlowRouter.go("/")
                    }
                });
            }
        });
    }
});
  
Template.passwordEdit.events({
    'click #editPassword' (e, t) {
        e.preventDefault();
        const userId = FlowRouter.getParam("_id");
        const old = $("#old-password").val()
        const newPassword = $("#new-password").val()
        const confirmation = $("#confirmation-password").val()

        if (old === "" || newPassword === "" || confirmation === "" ){
            failAlert("Pastikan semua Field terisi !")
        } 
        else {
            if (newPassword !== confirmation){
                failAlert("Password baru dan konfirmasi password tidak sama !")
            } 
            else {
                const data = {
                    userId,
                    old,
                    newPassword
                } 
                Meteor.call("users.changePassword", data, function (error, result) {
                    if (error) {
                        failAlert(error)
                    } 
                    else {
                        successAlert("Berhasil mengubah password")
                        FlowRouter.go("/")
                    }
                });
            }
        }
    },
    'click .hover-icon' (e, t) {
        history.back();
    },
    'click .toggle-password' (e, t) {
        const inputId = $(e.target).data("id");
        const input = t.find('#' + inputId);
        const icon = $(e.target);
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    },
})