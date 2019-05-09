/******************************
 * FORM CONTROL DEFAULTS MIXIN
 ******************************/
import { props } from '../../../../rb-base/scripts/rb-base.js';
import Converter from '../../../../rb-base/scripts/public/props/converters.js';

const Defaults = BaseElm => class extends BaseElm {
	/* Lifecycle
	 ************/
	connectedCallback() { // :void
		super.connectedCallback && super.connectedCallback();
		this.rb.formControl = {
			elm:      null, // form control element for setCustomValidity
			focusElm: null, // element to focus on form submit if invalid
			form:     null  // form element that control is in
		}
		// formControl: elm and focusElm set in component
		this.rb.formControl.form = this.closest('form');
	}

	/* Properties
	 *************/
	static get props() { // :object
		return {
			...super.props,
			name: props.string,
			disabled: Object.assign({}, props.boolean, {
				deserialize: Converter.valueless
			}),
			_error:   props.string,  // error message when invalid
			_active:  props.boolean, // control has focus
			_dirty:   props.boolean, // control has been interacted with
			_touched: props.boolean, // control has been blurred
			_valid: Object.assign({}, props.boolean, {
				default: true        // value is valid
			})
		}
	}

	/* Getters
	 **********/
	get hasForm() { // :boolean (readonly: true if inside form)
		return !!this.rb.formControl.form;
	}
}

/* Export it!
 *************/
export default Defaults;