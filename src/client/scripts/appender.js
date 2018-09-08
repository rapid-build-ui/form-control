/*******************
 * APPENDER SERVICE
 *******************/
const Appender = Base => class extends Base {
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
		this.elms.hiddenInput = document.createElement('input');
		this.elms.hiddenInput.setAttribute('hidden', true);
		this.elms.hiddenInput.setAttribute('name', this.name);
		this.elms.form.appendChild(this.elms.hiddenInput);
	}
	_removeHiddenInput() { // :void
		this.elms.hiddenInput.remove();
	}

	/* Event Management
	 *******************/
	_attachAppenderEvents() { // :void
		this.rb.events.add(this, 'value-changed', this._setHiddenInputValue);
		if (!this.hasValidation) return;
		this.rb.events.add(this, 'validated', this._validateHiddenInput);
		this.rb.events.add(this.elms.hiddenInput, 'invalid', this._preventNativeErrorrMsg);
	}

	/* Event Handlers
	 *****************/
	_preventNativeErrorrMsg(evt) { // :void (prevents native browser error message)
		evt.preventDefault();
	}
	_setHiddenInputValue(evt) { // :void (required to natively submit the value)
		const value = evt.detail.value; // component value
		this.elms.hiddenInput.value = value;
	}
	_validateHiddenInput(evt) { // :void
		const valid = evt.detail.valid; // :boolean
		const eMsg  = valid ? '' : 'invalid'; // empty string sets validity.valid to true
		this.elms.hiddenInput.setCustomValidity(eMsg);
	}
}

/* Export it!
 *************/
export default Appender;