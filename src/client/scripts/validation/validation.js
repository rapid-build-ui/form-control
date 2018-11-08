/*********************
 * VALIDATION SERVICE
 *********************/
import { props } from '../../../rb-base/scripts/rb-base.js';
import Type from '../../../rb-base/scripts/type-service.js';
import Messages from './messages.js'
import Validators from './validators.js'

const Validation = Base => class extends Base {
	/* Lifecycle
	 ************/
	viewReady() { // :void
		super.viewReady && super.viewReady();
		if (!this.hasValidation) return;
		this._attachValidationEvents();
	}

	/* Properties
	 *************/
	static get props() { // :object
		return {
			...super.props,
			validation: Object.assign({}, props.array, {
				// support for custom functions
				deserialize(val) { return eval(val); }
			}),
			_eMsg: props.string,
			_valid: Object.assign({}, props.boolean, {
				default: true
			})
		}
	}

	/* Getters
	 **********/
	get hasValidation() { // :boolean (readonly)
		return !!this.validation.length;
	}

	/* Public Methods
	 *****************/
	async validate() { // :void
		if (!this.hasValidation) return;
		let valid = true;
		for (const validator of this.validation) {
			if (!validator) break;
			if (!valid) break;
			switch(true) {
				case Type.is.function(validator):
					valid = await this._validateCustom.call(this, validator)
					break;
				case Type.is.object(validator):
					valid = this._validateObject.call(this, validator);
					break;
				default:
					valid = this._validateSimple(validator);
			}
		}
		if (valid) {
			this._eMsg = '';
			this.rb.elms.formControl.setCustomValidity('')
		}
		this._valid = valid;
		this.rb.events.emit(this, 'validated', {
			detail: { valid }
		});
	}

	/* Validation
	 *************/
	_validateSimple(validator) { // :boolean
		const out = Validators[validator](this.value);
		if (!out.valid) {
			this._eMsg = out.message || `${validator} ${Messages['default']}`;
			this.rb.elms.formControl.setCustomValidity(out.message);
		}
		return out.valid;
	}
	_validateObject(validator) { // :boolean
		const key = Object.keys(validator)[0];
		const out = Validators[key](this.value, validator[key]);
		if (!out.valid) {
			this._eMsg = out.message || `${validator} ${Messages['default']}`;
			this.rb.elms.formControl.setCustomValidity(out.message);
		}
		return out.valid;
	}
	async _validateCustom(validator) { // :boolean (validator is function)
		let out = await validator(this.value);
		if (!out.valid) {
			this._eMsg = out.message || `${validator} ${Messages['default']}`;
			this.rb.elms.formControl.setCustomValidity(out.message);
		}
		return out.valid;
	}

	/* Event Management
	 *******************/
	_attachValidationEvents() { // :void
		if (!this.hasForm) return;
		this.rb.events.add(this.rb.elms.form, 'submit', this._validateForm);

	}

	/* Event Handlers
	 *****************/
	_validateForm(evt) { // :void
		this.validate();
		if (this.rb.elms.form.checkValidity()) return;
		evt.preventDefault(); // prevents browser from submitting the form
		this._dirty   = true;    // TODO: improve
		this._blurred = true;    // TODO: improve

		this._setFocus(evt); // TODO: only focus first invalid form component
	}

	_setFocus(e) {
		const rbFormControls = ViewHelper.getRbFormControls(this.rb.elms.form);
		// console.log(rbFormControls);
		for (const item of rbFormControls) {
			if (!item._valid) {
				item.rb.elms.focusElm.focus();
				break;
			}
		}
	}
}

/* View Helper
 **************/
const ViewHelper = {
	getRbFormControls(form) { // object[]
		return Array.from( // converts NodeList to Array (needed for [].filter())
			form.querySelectorAll('*') // returns NodeList
		).filter(component => {
			const tagName  = component.tagName.toLowerCase();
			const tagNames = ['rb-input', 'rb-radios', 'rb-checkbox', 'rb-checkboxes'];
			return tagNames.includes(tagName);
		});
	}
}

/* Export it!
 *************/
export default Validation;