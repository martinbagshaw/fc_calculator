'use strict';

/*
to do:

 - use object to store values, not data-attrs
    - better not to manipulate the DOM unless I really need to
    https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes#Issues

 - decimals with leading zeros error - how can I replicate this?
    multiple 0s before . ?

 - take keyboard input
 - make large numbers fit on the display (shrink font size)
    - make number fit on the display
     - if overflows, shrink font size to fit
     - also needs to be done on =, separate function + event listener required



- - - - 
 done:

 - / * + prepended to display.value when starting at 0

 - delete button (delete number from right hand side)

 - use - button to start with -ve number

 - handle infinity, e.g. 9/0
 
 - handle Nan
    occurs when starting with operator followed by a number
    also operator followed by = NOTE: this is just further down the chain, prevent data-operator from getting added first
    /* <number> = 0
    +- <number> = +- <number>


 - +/- button
    handle 0 values or not

 - find an alternative to using count variable (used an object instead)
 - calc function not reliable - try 20.99 + 0.02 Does not = 21.01
    https://stackoverflow.com/questions/13077923/how-can-i-convert-a-string-into-a-math-operator-in-javascript
    https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript


 - getTotal still doesn't work
    2.3 - 3 = -0.77777777777777777772 ffs
    - try ends in any digit recurring
    - seems to affect -ve answers

 - <number> subtract <decimal starting with .5 NOT 0.5> does not work
 - <number> subtract <decimal starting with number, e.g. 5.5> does not work (only subtracts .5) 
    not pressing firmly enough? is this really why?
 

*/


// count - number of digits currently entered in the display textarea
// - resets to 0 on clear, and after operation button click
// let count = 0;
const c = {
    ount : 0,
    '+': (x, y) => { return x + y },
    '-': (x, y) => { return x - y },
    '*': (x, y) => { return x * y },
    '/': (x, y) => { return x / y }
}


// - - - - - - - - - - - - - - - - - - - -
// functions

// clear
const clearCalc = (e) => {
    const display = document.getElementById('display');
    if (e!==undefined) {
        e.preventDefault();
        e.target.textContent = 'AC';
    }
    display.value = '';
    display.dataset.total = '';
    display.dataset.operator = '';
    // reset count to 0
    c.ount = 0;
}



// create number
// - only 0-9 and . get entered into this function
const makeNumber = (e) => {
    e.preventDefault();

    const display = document.getElementById('display');
    
    // keyboard input
    const tapped = e.keyCode-48;

    // numbers 0-9 || 142
    const keyID = tapped.toString();
    let keyNum, keyDec;
    if (keyID.length === 1) {
        keyNum = parseInt(keyID);
    }
    else if (keyID === '142') {
        keyDec = true;
    }

    const number = parseInt(e.target.textContent) || keyNum;
    const decimal = e.target.textContent == '.' || keyDec;
    const hasDec = display.value.includes('.');
    

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

    const display = document.getElementById('display');

    /*
        1st click:
        - save screen total
        - save operator

        2nd click +:
        - return (data-total data-operator display.value)
        - add result to display and update data-total
        - add operator to data-operator
    */

    // 1st click of (- + / *)
    // - before anything saved to data-total
    if (display.dataset.total.length===0) {

        // start from 0 (no values entered)
        // - allow -ve number to be entered with -ve button
        if (display.value.length===0) {
            if (e.target.textContent=='-') {
                display.dataset.operator = e.target.textContent;
            } else {
                display.dataset.operator = '';
            }
        }

        // 1+ digit in display.value
        else {
            // -ve button clicked last
            if (display.dataset.operator.length>0) {
                // produces a -- in data-total
                getTotal();
                display.dataset.operator = e.target.textContent;
            }
            // else, update data-total and data-operator
            else {
                display.dataset.total = display.value;
                display.dataset.operator = e.target.textContent;
            }
        }

    }

    // 2nd click +
    else if (display.dataset.total.length > 0) {

        // run getTotal if c.ount>0
        if (c.ount>0) getTotal();
        // save operator value
        display.dataset.operator = e.target.textContent;
    }
    
    // reset count
    c.ount = 0;

}





// get total
const getTotal = (e) => {

    // fired by = button and perform operation
    const display = document.getElementById('display');

    // NOTE - operators return undefined

    // = button
    if (e!==undefined) {
        e.preventDefault();
    }

    // do the calculation:

    // get operator
    const operator = display.dataset.operator;

    // get values, then convert from strings to floats
    const val1 = parseFloat(display.dataset.total);
    const val2 = parseFloat(display.value);
  
    
    // handle -ve button and empty data-total (val1)
    if (!val1) {

        if (operator.length>0) {

            let multDiv = /\*|\//;
            multDiv = multDiv.test(operator);
            let neg = /-/;
            neg = neg.test(operator);

            // return 0
            if (multDiv === true) {
                display.value = 0;
                display.dataset.total = 0;
            }
            // return -ve
            else if (neg === true) {
                display.value = `${operator}${display.value}`;
                display.dataset.total = display.value;
            }
            
        }

        // no data-operator
        // else {
        //     console.log('= clicked, no data-operator');
        // }

    }

    else if (operator.length>0) {
        // perform operation, use precisionRound to round to 12 points
        // - stops native maths from being weird and 0.1 + 0.2 from being 0.3111112 or whatever
        let newTotal = precisionRound(c[operator](val1, val2), 12);
        if(isNaN(newTotal)||newTotal===Infinity) newTotal='Not a number';

        // update with new total
        display.value = `${newTotal}`;
        display.dataset.total = newTotal;
    }

    // Clear dataset AFTER above calculations if = button clicked
    // - required for performOperation to work correctly
    // - i.e. < = button> <operator button> clicked in succession
    if (e!==undefined) {
        display.dataset.total = '';
        display.dataset.operator = '';
    }
    
}

// precision round. Handles stuff like 0.1 + 0.2 and 20.99 + 0.02
const precisionRound = (number, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}



// invert total
// +/- button - inverts the calculated total, NOT the last entered operator
const invertTotal = (e) => {
    e.preventDefault();
    const display = document.getElementById('display');

    // prevent inverting values of 0:
    if (parseFloat(display.value)===0||-0) return;

    if (display.value.length > 0) {
        let isNeg = /^-/;
        isNeg = isNeg.test(display.value);
        if (isNeg == false) display.value = display.value.replace (/^/,'-');
        if (isNeg == true) display.value = display.value.replace (/^-/,'');
    }

}





// backspace / delete
// - just works with display.value
const backSpace = (e) => {
    e.preventDefault();

    // console.log(e);
    
    // console.log(e.keyCode);
    // console.log(e.target.id);
    let delBtn = /delete/;
    delBtn = delBtn.test(e.target.id);
    // console.log(delBtn);


    // if (e.keyCode!==8 || delBtn===false) return false;
    // if (e.keyCode!==8) return false;
    // if (delBtn===false) return false;

    const display = document.getElementById('display');
    if (display.value.length > 0) {
        let disArr = [...display.value];
        disArr.pop();
        display.value = `${disArr.join('')}`;
    }    
}






// - - - - - - - - - - - - - - - - - - - -
// event listeners

// buttons
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


// keys
window.addEventListener('keydown', makeNumber);
// window.addEventListener('keydown', backSpace);

