/*****************
 * APPENDER MIXIN
 *****************/
import Type from '../../../../base/scripts/public/services/type.js';

const Appender = BaseElm => class extends BaseElm {
	/* Lifecycle
	 ************/
	connectedCallback() { // :void
		super.connectedCallback && super.connectedCallback();
		if (!this.hasForm) return;
		// needed to interact with native form
		const formTag = this.rb.formControl.isTextarea ? 'textarea' : 'input';
		Object.assign(this.rb.formControl, {
			hiddenInput: document.createElement(formTag)
		});
		this._addHiddenInput();
		this._attachAppenderEvents();
	}
	disconnectedCallback() { // :void
		super.disconnectedCallback && super.disconnectedCallback();
		if (!this.hasForm) return;
		this._removeHiddenInput();
	}

	/* Private Methods
	 ******************/
	_addHiddenInput() { // :void
		const { form, hiddenInput } = this.rb.formControl;
		hiddenInput.style.display = 'none';
		hiddenInput.setAttribute('hidden', '');
		hiddenInput.setAttribute('name', this.name);
		form.appendChild(hiddenInput);
	}
	_removeHiddenInput() { // :void
		this.rb.formControl.hiddenInput.remove();
	}

	/* Event Management
	 *******************/
	_attachAppenderEvents() { // :void
		this.rb.events.add(this, 'value-changed', this._setHiddenInputValue);
		this.rb.events.add(this, 'validated', this._validateHiddenInput);
		this.rb.events.add(this.rb.formControl.hiddenInput, 'invalid', this._preventNativeErrorrMsg);
	}

	/* Event Handlers
	 *****************/
	_preventNativeErrorrMsg(evt) { // :void (prevents native browser error message)
		if (!this.hasValidation) return;
		evt.preventDefault();
	}
	_validateHiddenInput(evt) { // :void
		if (!this.hasValidation) return;
		const validity = evt.detail.validity
		// console.log(`HIDDEN INPUT ${this.localName.slice(3).toUpperCase()}:`, validity);
		this.rb.formControl.hiddenInput.setCustomValidity(validity.message);
	}
	/* Required to natively submit the value.
	 * For arrays and objects JSON.stringify needed.
	 * Without it hidden input value will be (examples):
	 * - array:  "thor,superman,wolverine"
	 * - object: "[object Object]"
	 * Then to get the value server can run:
	 * - JSON.parse(decodeURIComponent(value))
	 ***************************************************/
	_setHiddenInputValue(evt) { // :void
		let value = evt.detail.value; // component value
		const stringify = Type.is.array(value) || Type.is.object(value);
		if (stringify) value = JSON.stringify(value);
		// console.log(`${this.localName.slice(3).toUpperCase()}:`, value);
		this.rb.formControl.hiddenInput.value = value;
	}
}

/* Export it!
 *************/
export default Appender;