/**********************************
 * FORM CONTROLS MIXIN
 * -------------------------------
 * Mixins execution order:
 * inside -> out (must call super)
 **********************************/
import Defaults   from './private/mixins/defaults.js';
import Appender   from './private/mixins/appender.js';
import Validation from './private/mixins/validation.js';

const FormControl = BaseElm => Appender(Validation(Defaults(BaseElm)));

/* Export it!
 *************/
export default FormControl;