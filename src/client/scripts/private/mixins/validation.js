/*******************
 * VALIDATION MIXIN
 *******************/
import { props }  from '../../../../base/scripts/base.js';
import Type       from '../../../../base/scripts/public/services/type.js';
import Helpers    from '../../public/helpers.js'
import Messages   from '../../public/validation/messages.js'
import Validators from '../../public/validation/validators.js'

const Validation = BaseElm => class extends BaseElm {
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
				deserialize(val) { return eval(val); } // support for custom functions
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
		this._dirty   = dirty;
		this._touched = dirty;
	}
	setValidity(validity) { // :void
		this._error = validity.message; // used in template
		this._valid = validity.valid;   // used in template
		this.rb.formControl.elm.setCustomValidity(validity.message); // empty string clears error and makes valid
		this.rb.events.emit(this, 'validated', { // ex: appender.js
			detail: { validity }
		});
		this.setChildrenValidity(validity);
	}
	setChildrenValidity(validity) { // :void (recursive)
		const rbChildrenFormControls = Helpers.getRbFormControls(this.shadowRoot);
		for (const control of rbChildrenFormControls) {
			if (!control.showErrorMessage) validity.message = ''; // default
			control.setValidity(validity);
		}
	}
	setPristine() { // :void
		this.setDirty(false);
		this.setValidity({ valid: true, message: '' });
	}

	/* Form Element
	 ***************/
	_addValidationMethodsToForm() { // :void (only add them once)
		if (this.rb.formControl.form.rb) return;

		this.rb.formControl.form.rb = {
			setPristine: () => { // :void
				const rbFormControls = Helpers.getRbFormControls(this.rb.formControl.form);
				for (const control of rbFormControls) {
					if (!control.hasValidation) continue;
					control.setPristine();
				}
			},
			validate: async (fromRbButton = false) => { // :void
				const rbFormControls = Helpers.getRbFormControls(this.rb.formControl.form);
				let controlFocused = false;
				for (const control of rbFormControls) {
					if (!control.hasValidation) continue;
					await control.validate();
					if (control._valid) {
						// technique to prevent validating twice in this._validateForm()
						if (fromRbButton) control.rb.formControl.rbButtonValidated = true;
						continue;
					}
					control.setDirty(true);
					if (controlFocused) continue;
					control.rb.formControl.focusElm.focus();
					controlFocused = true;
				}
			}
		}
	}

	/* Event Management
	 *******************/
	_attachValidationEvents() { // :void
		if (!this.hasForm) return;
		this._addValidationMethodsToForm();
		this.rb.events.add(this.rb.formControl.form, 'submit', this._validateForm, {
			capture: true // fire our event first, no guarantees
		});
	}

	/* Event Handlers
	 *****************/
	async _validateForm(evt) { // :void
		const { formControl } = this.rb;
		if (formControl.rbButtonValidated) return delete formControl.rbButtonValidated; // rb-button already validated
		await this.validate(); // TODO: check promise support
		if (formControl.form.checkValidity()) return;
		evt.preventDefault(); // prevents browser from submitting the form
		this.setDirty(true);
		this._setFocus();
	}
	_setFocus() { // :void (focus first invalid form component)
		const rbFormControls = Helpers.getRbFormControls(this.rb.formControl.form);
		for (const control of rbFormControls) {
			if (control._valid) continue;
			control.rb.formControl.focusElm.focus();
			break;
		}
	}
}

/* Export it!
 *************/
export default Validation;