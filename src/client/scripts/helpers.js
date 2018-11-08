/***********************
 * FORM CONTROL HELPERS
 ***********************/
const Helpers = {
	getRbFormControls(form) { // object[]
		// spread converts NodeList to Array, needed for filter()
		return [...form.querySelectorAll('*')].filter(elm => {
			return Boolean(elm.rb && elm.rb.isFormControl);
		});
	}
};

/* Export it!
 *************/
export default Helpers;