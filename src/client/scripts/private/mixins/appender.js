/*****************
 * APPENDER MIXIN
 *****************/
import Type from '../../../../rb-base/scripts/public/services/type.js';

const Appender = BaseElm => class extends BaseElm {
	/* Lifecycle
	 ************/
	connectedCallback() { // :void
		super.connectedCallback && super.connectedCallback();
		if (!this.hasForm) return;
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
		this.rb.elms.hiddenInput = document.createElement('input');
		this.rb.elms.hiddenInput.setAttribute('hidden', '');
		this.rb.elms.hiddenInput.setAttribute('name', this.name);
		this.rb.elms.form.appendChild(this.rb.elms.hiddenInput);
	}
	_removeHiddenInput() { // :void
		this.rb.elms.hiddenInput.remove();
	}

	/* Event Management
	 *******************/
	_attachAppenderEvents() { // :void
		this.rb.events.add(this, 'value-changed', this._setHiddenInputValue);
		if (!this.hasValidation) return;
		this.rb.events.add(this, 'validated', this._validateHiddenInput);
		this.rb.events.add(this.rb.elms.hiddenInput, 'invalid', this._preventNativeErrorrMsg);
	}

	/* Event Handlers
	 *****************/
	_preventNativeErrorrMsg(evt) { // :void (prevents native browser error message)
		evt.preventDefault();
	}
	_validateHiddenInput(evt) { // :void
		const validity = evt.detail.validity
		// console.log(`HIDDEN INPUT ${this.localName.slice(3).toUpperCase()}:`, validity);
		this.rb.elms.hiddenInput.setCustomValidity(validity.message);
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
		this.rb.elms.hiddenInput.value = value;
	}
}

/* Export it!
 *************/
export default Appender;