import "./lecturers.html";
import "../../components/card/card";
import "../../components/tables/tables";
import "../../components/forms/forms";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.lecturers_add.onCreated(function (){

});