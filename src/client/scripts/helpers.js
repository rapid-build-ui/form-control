/***********************
 * FORM CONTROL HELPERS
 ***********************/
const TAG_NAMES = [
	'rb-input',
	'rb-radios',
	'rb-checkbox',
	'rb-checkboxes'
];

const Helpers = {
	getRbFormControls(form) { // object[]
		// spread converts NodeList to Array, needed for filter()
		return [...form.querySelectorAll('*')].filter(elm => {
			const tagName = elm.tagName.toLowerCase();
			return TAG_NAMES.includes(tagName);
		});
	}
};

/* Export it!
 *************/
export default Helpers;