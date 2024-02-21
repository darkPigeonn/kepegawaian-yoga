import "./image.html";


Template.imageComponent.events({
    'click .profile-img' (e, t) {
        e.preventDefault();
        window.open(e.target.src, '_blank');
    }
});