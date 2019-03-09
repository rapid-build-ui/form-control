/***********************
 * FORM CONTROL HELPERS
 ***********************/
const Helpers = {
	getRbFormControls(rootElm) { // object[]
		// spread converts NodeList to Array, needed for filter()
		return [...rootElm.querySelectorAll('*')].filter(elm => {
			return Boolean(elm.rb && elm.rb.formControl);
		});
	}
};

/* Export it!
 *************/
export default Helpers;