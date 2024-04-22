import "./select.html";

Template.c_select.onRendered(function () {
  // In your Javascript (external .js resource or <script> tag)
  $(document).ready(function () {
    $(".select2").select2();
  });
});
