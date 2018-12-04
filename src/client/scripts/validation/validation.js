/*********************
 * VALIDATION SERVICE
 *********************/
import { props } from '../../../rb-base/scripts/rb-base.js';
import Type from '../../../rb-base/scripts/type-service.js';
import Helpers from '../helpers.js'
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
		let validity = { valid: true, message: '' };
		for (const validator of this.validation) {
			if (!validity.valid) break;
			switch(true) {
				case Type.is.function(validator):
					validity = await validator(this.value);
					break;
				case Type.is.object(validator):
					const key = Object.keys(validator)[0];
					validity = Validators[key](this.value, validator[key]);
					break;
				default: // validator is string
					validity = Validators[validator](this.value);
			}
			if (validity.valid) { validity.message = ''; continue; };
			if (!validity.message) validity.message = Messages['default'];
		}
		this.setValidity(validity);
	}
	setDirty(dirty) { // :void  (ex: rb-input)
		// console.log(`${this.localName.toUpperCase()}:`, 'set dirty');
		if (Type.is.boolean(this._dirty))   this._dirty   = dirty.dirty;
		if (Type.is.boolean(this._blurred)) this._blurred = dirty.blurred;
	}
	setValidity(validity) { // :void
		// console.log(`${this.localName.toUpperCase()}:`, 'set validity');
		this._eMsg  = validity.message; // used in template
		this._valid = validity.valid;   // used in template
		this.rb.elms.formControl.setCustomValidity(validity.message); // empty string clears error and makes valid
		this.rb.events.emit(this, 'validated', { // ex: appender.js
			detail: { validity }
		});
		this.setChildrenValidity(validity)
	}

	setChildrenValidity(validity) {
		const rbChildrenFormControls = Helpers.getRbFormControls(this.shadowRoot);
		for (const control of rbChildrenFormControls) {
			control.setValidity({ valid: validity.valid, message: '' })
		}
	}

	setPristine() { // :void
		// console.log(`${this.localName.toUpperCase()}:`, 'set pristine');
		this.setDirty({ blurred: false, dirty: false });
		this.setValidity({ valid: true, message: '' });
	}

	/* Event Management
	 *******************/
	_attachValidationEvents() { // :void
		if (!this.hasForm) return;
		this._addFormEvents();
		this.rb.events.add(this.rb.elms.form, 'submit', this._validateForm, {
			capture: true // fire our event first, no guarantees
		});
	}
	_addFormEvents() { // :void
		if (this.rb.elms.form.rb) return; // only add it once
		this.rb.elms.form.rb = {
			setPristine: () => {
				// console.log('FORM:', 'set pristine');
				const rbFormControls = Helpers.getRbFormControls(this.rb.elms.form);
				for (const control of rbFormControls) {
					if (!control.hasValidation) continue;
					control.setPristine();
				}
			}
		}
	}

	/* Event Handlers
	 *****************/
	_validateForm(evt) { // :void
		this.validate(); // TODO: check promise support
		if (this.rb.elms.form.checkValidity()) return;
		evt.preventDefault(); // prevents browser from submitting the form
		this.setDirty({ blurred: true, dirty: true });
		this._setFocus(evt);
	}
	_setFocus(evt) { // :void (only focus first invalid form component)
		const rbFormControls = Helpers.getRbFormControls(this.rb.elms.form);
		for (const control of rbFormControls) {
			if (!!control._valid) continue;
			control.rb.elms.focusElm.focus();
			break;
		}
	}
}

/* Export it!
 *************/
export default Validation;