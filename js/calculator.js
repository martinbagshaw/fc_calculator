'use strict';

// c object
// - .ount = number of digits entered in the display textarea.
//      - Resets to 0 on clear, and after operation button click
// - convert operator string to function
// - save the running total and latest operator as strings for calculations
const c = {
    ount : 0,
    '+': (x, y) => { return x + y },
    '-': (x, y) => { return x - y },
    '*': (x, y) => { return x * y },
    '/': (x, y) => { return x / y },
    total : '',
    operator : '',
}


// - - - - - - - - - - - - - - - - - - - -
// functions

// clear
const clearCalc = (e) => {

    // keyboard input
    // - filter out all keyboard input that is not required
    if (e.type=='keydown' && (e.shiftKey===false&&e.metaKey===false) ) return false;
    if (e.type=='keydown' && e.keyCode!==82) return false;

    const display = document.getElementById('display');
    const clearBtn = document.getElementById('clear');
    if (e!==undefined) {
        e.preventDefault();
        clearBtn.textContent = 'AC';
    }
    display.value = '';
    c.total = '';
    c.operator = '';
    // reset count to 0
    c.ount = 0;
}



// create number
// - only 0-9 and . get entered into this function
const makeNumber = (e) => {
    e.preventDefault();

    const keyID = e.keyCode-48; // convert to 0-9
    // - filter out all keyboard input that is not required (non 0-9 and .)
    if (e.shiftKey===true||e.metaKey===true) return false;
    if (e.type=='keydown' && (keyID<0 || keyID>9 && keyID!==142)) return false;

    const display = document.getElementById('display');
    const hasDec = display.value.includes('.');
    let number, decimal;

    // handle keyboard and click inputs
    if (e.type == 'keydown') {
        if (keyID.toString().length === 1) number = parseInt(keyID);
        if (keyID === 142) decimal = true;
    } else if (e.type == 'click') {
        number = parseInt(e.target.textContent);
        if (e.target.textContent == '.') decimal = true;
    }    

    // clear display
    if (c.ount == 0) display.value = '';

    // add number
    if (!isNaN(number)) display.value += number;

    // add decimal
    if (decimal===true && (display.value.length==0 || hasDec===false)) display.value += '.';

    // update count
    c.ount = display.value.length;

    // clear button state - switch AC to C
    if (display.value.length > 0) document.getElementById('clear').textContent = 'C';

}




// perform operations ( + - * / )
const performOperation = (e) => {
    e.preventDefault();

    // keyboard input
    // - filter out all keyboard input that is not required
    if (e.type=='keydown' && (e.shiftKey===false&&e.metaKey===false) ) return false;    
    // keycodes are: 191/ 56* 189- 187+
    if (e.keyCode!==undefined && (e.keyCode!==191&&e.keyCode!==56&&e.keyCode!==189&&e.keyCode!==187) ) return false;

    // convert keyCode to operator
    const Kc = e.keyCode;
    const findOp = {
        187: '+',
        189: '-',
        56: '*',
        191: '/'
    }

    // handle keyboard and click inputs
    // - makes sure operator from keypress isn't picked up from the DOM
    const myOp = (findOp[Kc]===undefined) ? e.target.textContent : findOp[Kc];

    const display = document.getElementById('display');

    /*
        1st click:
        - save screen total
        - save operator

        2nd click +:
        - return (c.total c.operator display.value)
        - add result to display and update c.total
        - add operator to c.operator
    */

    // 1st click of (- + / *)
    // - before anything saved to c.total
    if (c.total.length===0) {

        // start from 0 (no values entered)
        // - allow -ve number to be entered with -ve button
        if (display.value.length===0) {
            if (e.target.textContent=='-'||e.keyCode===189) {
                c.operator = '-'; // e.target.textContent
            } else {
                c.operator = '';
            }
        }

        // 1+ digit in display.value
        else {
            // -ve button clicked last
            if (c.operator.length>0) {
                getTotal();
                c.operator = myOp;
            }
            // else, update c.total and c.operator
            else {
                c.total = display.value;
                c.operator = myOp;
            }
        }

    }

    // 2nd click +
    else if (c.total.length>0) {
        
        // run getTotal if c.ount>0
        if (c.ount>0) getTotal();
        // update c.total and c.operator
        c.total = display.value;
        c.operator = myOp;
    }
    
    // reset count
    c.ount = 0;

}





// get total
const getTotal = (e) => {

    // fired by = button and perform operation
    const display = document.getElementById('display');

    // NOTE - operators (from performOperation) return undefined

    // = button
    if (e!==undefined) {
        e.preventDefault();
        // - filter out all keyboard input that is not required
        if (e.type=='keydown' && e.keyCode!==13) return false;
    }

    // do the calculation:

    // get operator
    const operator = c.operator;

    // get values, then convert from strings to floats
    const val1 = parseFloat(c.total);
    const val2 = parseFloat(display.value);  
    
    // handle -ve button and empty c.total (val1)
    if (!val1) {

        if (operator.length>0) {

            let multDiv = /\*|\//; // * or /
            multDiv = multDiv.test(operator);
            let neg = /-/;
            neg = neg.test(operator);

            // return 0
            if (multDiv === true) {
                display.value = 0;
                c.total = 0;
            }
            // return -ve
            // - if display.value begins with -ve, remove -ve from op and display
            else if (neg === true) {
                display.value = `${operator}${display.value}`;
                c.total = display.value;
            }
            
        }

    }

    else if (operator.length>0) {
        // perform operation, use precisionRound to round to 12 points
        // - stops native maths from producing errors
        let newTotal = precisionRound(c[operator](val1, val2), 12);
        if(isNaN(newTotal)||newTotal===Infinity) newTotal='Not a number';

        // update with new total
        display.value = `${newTotal}`;
        c.total = newTotal;
    }

    // Clear c.total and c.operator AFTER above calculations if = button clicked
    // - required for performOperation to work correctly
    // - i.e. < = button> <operator button> clicked in succession
    if (e!==undefined) {
        c.total = '';
        c.operator = '';
    }
    
}

// precision round function
// - handles stuff like 0.1 + 0.2 = 0.33 and 20.99 + 0.02 = 21.009999999999998
// - corrects native js rounding errors
const precisionRound = (number, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}



// invert total (+/- button)
const invertTotal = (e) => {
    e.preventDefault();
    const display = document.getElementById('display');

    // prevent inverting values of 0:
    if (parseFloat(display.value)===0||-0) return false;

    if (display.value.length > 0) {
        // if display or operator = -ve
        const isNeg = /^-/;
        const negNum = isNeg.test(display.value);
        const negOp = isNeg.test(c.operator);

        // +ve number
        if (negNum===false && negOp===false) display.value = display.value.replace (/^/,'-');
        if (negNum===false && negOp===true) c.operator = '';
        
        // -ve number
        if (negNum===true) display.value = display.value.replace (/^-/,'');
    }

}





// backspace / delete
// - just works with display.value
const backSpace = (e) => {
    e.preventDefault();

    // backspace button only - keypress only applies to keys that produce a character value
    // - filter out all keyboard input that is not required
    if (e.shiftKey===true||e.metaKey===true) return false;
    if (e.type=='keydown' && e.keyCode!==8) return false;

    const display = document.getElementById('display');
    if (display.value.length > 0) {
        let disArr = [...display.value];
        disArr.pop();
        display.value = `${disArr.join('')}`;
    }  
 
}






// - - - - - - - - - - - - - - - - - - - -
// event listeners
// - buttons
const numBtns = [...document.querySelectorAll('form :nth-child(n+3) > button:not(.operator)')];
numBtns.forEach(button => button.addEventListener('click', makeNumber));

const opBtns = [...document.querySelectorAll('.operator:not(#equals)')];
opBtns.forEach(button => button.addEventListener('click', performOperation));

const eqBtn = document.getElementById('equals');
eqBtn.addEventListener('click', getTotal);

const clearBtn = document.getElementById('clear');
clearBtn.addEventListener('click', clearCalc);

const invertBtn = document.getElementById('invert');
invertBtn.addEventListener('click', invertTotal);

const delBtn = document.getElementById('delete');
delBtn.addEventListener('click', backSpace);

// - keyboard input
// - keydown has more stable implementation
// - using keypress works for character producing keys, but not for backspace, and not in combination
document.addEventListener('keydown', makeNumber);
document.addEventListener('keydown', backSpace);
document.addEventListener('keydown', getTotal);
document.addEventListener('keydown', performOperation);
document.addEventListener('keydown', clearCalc);

