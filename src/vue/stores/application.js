import Vue from 'vue';
import Vuex from 'vuex';
import validate from 'validate.js';
import api from '@/api';
import qualifiers from '@/stores/modules/qualifiers';
import scholarships from '@/stores/modules/scholarships';
import _ from 'lodash';

Vue.use(Vuex);

const studentConstraints = {
	first_name: {
		presence: {
			allowEmpty: false,
		},
	},
	last_name: {
		presence: {
			allowEmpty: false,
		},
	},
	znumber: {
		presence: {
			allowEmpty: false,
		},
		length: {
			is: 8,
		},
	},
	email: {
		presence: {
			allowEmpty: false,
		},
		email: true,
		format: {
			pattern: /.*fau\.edu$/,
			message: 'should end in fau.edu',
		},
	},
};

const store = new Vuex.Store({
	modules: {
		qualifiers,
		scholarships,
	},
	state: {
		selected_scholarships: [],
		student: {
			first_name: '',
			last_name: '',
			znumber: '',
			email: '',
			videoAuth: null,
		},
		qualifications: {},
		answers: {},
		invalid: {
			student: null,
			qualifications: false,
			answers: false,
		},
		submit: false,
		result: false,
	},
	getters: {
	},
	mutations: {
		setInvalid(state, invalid) {
			state.invalid = invalid;
		},
		setSubmit(state, submit) {
			state.submit = submit;
		},
		setResult(state, result) {
			state.result = result;
		},
		setAnswers(state, answers) {
			state.answers = answers;
		},
		setStudent(state, student) {
			state.student = student;
		},
		setQualifications(state, qualifications) {
			state.qualifications = qualifications;
		},
		toggleSelectedScholarship(state, code) {
			const sch = state.selected_scholarships.indexOf(code);
			if (sch === -1) {
				state.selected_scholarships.push(code);
				state.answers[code] = {};
			} else {
				state.selected_scholarships.splice(sch, 1);
				delete state.answers[code];
			}
		},
	},
	actions: {
		updateStudent: _.debounce((context, item) => {
			context.commit('setStudent', item);
			const invalid = { ...context.state.invalid };
			invalid.student = validate(item, studentConstraints) || false;
			context.commit('setInvalid', invalid);
		}, 1000),
		updateAnswers(context, item) {
			context.commit('setAnswers', item);
		},
		updateQualifications(context, item) {
			context.commit('setQualifications', item);
		},
		submitAnswers({ commit, state }) {
			commit('setSubmit', true);
			const student = { ...state.student };
			student.znumber = `Z${student.znumber}`;
			student.qualifications = state.qualifications;
			const answers = {
				student,
				answers: state.answers,
			};
			api.submitAnswers(answers).then((response) => {
				commit('setResult', response.data);
			});
		},
	},
});

export default store;