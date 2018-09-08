/**********************
 * FORM CONTROLS MIXIN
 **********************/
import Defaults   from './defaults.js';
import Appender   from './appender.js';
import Validation from './validation/validation.js';

const FormControl = Base => Appender(Validation(Defaults(Base)));

/* Export it!
 *************/
export default FormControl;