const createScholarship = ({
	id = null,
	code = "",
	name = "",
	description = "",
	active = false,
	max = 0,
	questions = [],
	requirements = []
} = {}) => ({
	id,
	code,
	name,
	description,
	active,
	max,
	questions: questions.map(q => q.id),
	requirements: requirements.map(r => {r.qualifier = r.qualifier.id; return r;})
});



var editor = new Vue({
	el: '#editor',
	data: {
		scholarship: createScholarship(sch),
		questions,
		qualifiers,
		categoryCursor: '',
		requirement: {}
	},
	computed: {
		requirementCategories(){
			return this.scholarship.requirements.reduce((a,e)=>{
				if(a.indexOf(e.category) == -1){
					a.push(e.category);
				}
				return a;
			},[]);
		},
		addOrDeleteCategory(){
			return typeof this.scholarship.requirements[this.categoryCursor] == "undefined" || this.categoryCursor == '';
		}
	},
	methods: {
		category(){
			if(this.addOrDeleteCategory){
				this.scholarship.requirements[this.categoryCursor] = [];
			} else {
				delete this.scholarship.requirements[this.categoryCursor];
			}
			this.categoryCursor = '';
		},
		newRequirement(cat){
			modal.newRequirement(cat);
		},
		editRequirement(req){
			modal.editRequirement(req);
		}
	}
});

var modal = new Vue({
	el: "#requirementModal",
	data: {
		qualifiers,
		requirement: {}
	},
	computed: {
		requirementQualifier(){
			return this.qualifiers[this.requirement.qualifier] || false;
		}
	},
	methods: {
		editRequirement(req){
			this.requirement = req;
			this.requirement.isNew = false;
		},
		newRequirement(category){
			this.requirement = {
				category,
				qualifier: 0,
				valid: [],
			}
			this.requirement.isNew = true;
		},
		saveRequirement(){
			if(this.requirement.isNew && this.requirement.qualifier){
				if(this.requirement.valid == 0) this.requirement.valid = null;
				editor.scholarship.requirements.push(this.requirement);
			}
		}
	}
})