/******************************
 * FORM CONTROL DEFAULTS MIXIN
 ******************************/
import { props } from '../../../../rb-base/scripts/rb-base.js';

const Defaults = BaseElm => class extends BaseElm {
	/* Lifecycle
	 ************/
	connectedCallback() { // :void
		super.connectedCallback && super.connectedCallback();
		this.rb.isFormControl = true;
		this.rb.elms.form = this.closest('form');
	}

	/* Properties
	 *************/
	static get props() { // :object
		return {
			...super.props,
			disabled: props.boolean,
			name: props.string
		}
	}

	/* Getters
	 **********/
	get hasForm() { // :boolean (readonly: true if inside form)
		return !!this.rb.elms.form;
	}
}

/* Export it!
 *************/
export default Defaults;