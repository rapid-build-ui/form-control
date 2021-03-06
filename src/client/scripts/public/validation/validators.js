/*************
 * VALIDATORS
 *************/
import Type     from '../../../../base/scripts/public/services/type.js';
import Messages from '../../public/validation/messages.js'

/* Helpers (all return boolean)
 **********/
const Help = {
	arrayRequired(val) {
		return !!val.length;
	},

	stringRequired(val) {
		return !!val || val === 0;
	},

	arrayMaxLength(val, params, lengthKey='length') {
		var count, fn, item, j, len;
		if (!val) return false;
		if (params.generalArray)
			return val.length <= params[lengthKey];
		count = 0;
		fn = item => {
			if (!item.selected) return;
			return count++;
		};
		for (j = 0, len = val.length; j < len; j++) {
			item = val[j];
			fn(item);
		}
		return count <= params[lengthKey];
	},

	arrayMinLength(val, params, lengthKey='length') {
		var count, fn, item, j, len;
		if (!val) return false;
		if (params.generalArray)
			return val.length >= params[lengthKey];
		count = 0;
		fn = item => {
			if (!item.selected) return;
			return count++;
		};
		for (j = 0, len = val.length; j < len; j++) {
			item = val[j];
			fn(item);
		}
		return count >= params[lengthKey];
	},

	stringMaxLength(val, params, lengthKey='length') {
		var char, j, len, ref, regEx;
		if (!val) return true;
		if (params['ignoreSpecChars']) {
			if (params['specChar']) {
				ref = params['specChar'];
				for (j = 0, len = ref.length; j < len; j++) {
					char = ref[j];
					regEx = new RegExp("" + char, "g");
					val = val.replace(regEx, '');
				}
			}
			if (!params['specChar']) {
				if (params['ignoreSpecChars']) {
					val = val.replace(/\W/gi, '');
				}
			}
		}
		return val.toString().trim().length <= params[lengthKey];
	},

	stringMinLength(val, params, lengthKey='length') {
		var char, j, len, ref, regEx;
		if (!val) return true;
		if (params['ignoreSpecChars']) {
			if (params['specChar']) {
				ref = params['specChar'];
				for (j = 0, len = ref.length; j < len; j++) {
					char = ref[j];
					regEx = new RegExp("" + char, "g");
					val = val.replace(regEx, '');
				}
			}
			if (!params['specChar']) {
				if (params['ignoreSpecChars']) {
					val = val.replace(/\W/gi, '');
				}
			}
		}
		return val.toString().trim().length === 0 ||
			Type.is.object(params) ? val.toString().trim().length >= params[lengthKey] : val.toString().trim().length >= params;
	},

	setMinMaxMsgParams(params, minOrMax) {
		params.minOrMaxMsgText = minOrMax === 'min' ? 'Minimum' : 'Maximum';
		return params.minOrMaxMsgNum = minOrMax === 'min' ? params.min : params.max;
	}
}
const Validators = {
	currency(val) {
		if (!val) return {valid: true};
		return /^[-]?\d{1,9}(\.\d{1,2})?$/.test(val);
	},

	date(val) {
		if (!val || Type.is.undefined(val)) return true;
		// return dateService.isValidDate(val);
		return {valid: true}; // TODO: create dateService.isValidDate()
	},

	dateRange(val, params) {
		// if ((Type.is.undefined(val)) || !val || !dateService.isValidDate(val))
		if ((Type.is.undefined(val)) || !val) // TODO: create dateService.isValidDate()
			return {valid: true};;
		if (!params.fromDate || !params.thruDate)
			return {valid: true};
		// return dateService.withinRange(val, params.fromDate, params.thruDate);
		return {valid: true}; // TODO: create dateService.withinRange()
	},

	email(val) {
		if (!val) return {valid: true};
		return {
			valid: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
		}
	},

	fax(val) {
		return this.phone(val);
	},

	integer(val, params={}) {
		var re;
		if (!val) return {valid: true};
		re = params.positive ? /^\d*$/ : /^\-?\d*$/;
		return re.test(val);
	},

	maxLength(val, params) {
		return Type.is.array(val) ?
			Help.arrayMaxLength(val, params) :
			Help.stringMaxLength(val);
	},

	minLength(val, params) {
		return Type.is.array(val) ?
			{
				valid: Help.arrayMinLength(val, params),
				message: `${Messages['minLength']} is ${params}`
			}
			:
			{
				valid: Help.stringMinLength(val, params),
				message: `${Messages['minLength']} ${params}`
			}
	},

	minMaxLength(val, params) {
		var flag = true;
		var output = {}
		if (Type.is.array(val)) {
			flag = Help.arrayMinLength(val, params, 'min');
			if (flag) {
				flag = Help.arrayMaxLength(val, params, 'max');
			}
		} else {
			flag = Help.stringMinLength(val, params, 'min');
			if (flag) {
				flag = Help.stringMaxLength(val, params, 'max');
			}
		}
		output.valid = flag;
		if (!flag)
			output.message = `${Messages['minMaxLength']} ${params.min} and ${params.max}`

		return output;
	},

	noDups(val, params={}) {
		if (!val) return {valid: true};
		if (!Type.is.array(val)) return true;
		// return !new Collection(val).hasDups(params.exclude);
		return false; // TODO: create Collection.hasDups();
	},

	number(val, params={}) {
		if (!val) return { valid: true };
		var re = params.positive ? /^\d+\.?\d*$/ : /^\-?\d+\.?\d*$/;
		return {
			valid: re.test(val),
			message: `${Messages['number']}`
		}
	},

	phone(val) {
		if (!val) return {valid: true};
		// if (/[\W]|\_/.test(val)) return false;

		return {
			valid: /^[0-9]{10}$/.test(val),
			message: `${Messages['phone']}`
		}
	},

	phoneExt(val, params={}) {
		if (!val) return {valid: true};
		if (Type.is.undefined(params.length))
			params.length = 5;
		return this.maxLength(val, params);
	},

	range(val, params) {
		if (!this.number(val)) return {valid: true};
		if (!val) return {valid: true};
		return {
			valid: (this.number(val)) && (val >= params.min) && (val <= params.max),
			message: `${Messages['range']} ${params.min} and ${params.max}`
		}
	},

	regEx(val, params) {
		if (!val) return {valid: true};
		return {valid: val.match(params)};
	},

	required(val) {
		const valid = Type.is.array(val) ?
			Help.arrayRequired(val) :
			Help.stringRequired(val);
		return {
			valid,
			message: `${Messages['required']}`
		}
	},

	validCharset(val, params) {
		var char, chars, code, i, invalids, valids;
		if (!val) return true;
		if (!Type.is.string(val)) return true;
		chars = val.split('');
		valids = [9, 10, 11];
		invalids = {};
		for (i in chars) {
			char = chars[i];
			code = char.charCodeAt(0);
			if (code >= 32 && code <= 126 || valids.indexOf(code) !== -1)
				continue;
			invalids[char] = code;
		}
		invalids = Object.keys(invalids);
		params.invalids = invalids.join('');
		return !invalids.length;
	},

	zip(val) {
		if (!val) return {valid: true};
		if (this.integer(val) === false) return false;
		return this.minMaxLength(val, {
			min: 5,
			max: 5
		});
	}
}

/* Export it!
 *************/
export default Validators;