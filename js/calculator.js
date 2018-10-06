'use strict';

/*
to do:

 - take keyboard input
 - +/- button
 - Nan / not a number (input may be filtered well enough to avoid needing to do this)
 - make large numbers fit on the display (shrink font size)

*/




// count - number of digits currently entered in the display textarea
// - resets to 0 on clear, and after operation button click
// - probably not best practice, but it works
let count = 0;




// - - - - - - - - - - - - - - - - - - - -
// functions
// clear
function clearCalc(e) {
    e.preventDefault();
    const display = document.getElementById('display');
    e.target.textContent = 'AC';
    display.value = '';
    display.dataset.total = '';
    display.dataset.operator = '';
    // reset count to 0
    count = 0;
}



// create number
function makeNumber(e) {
    e.preventDefault();

    const display = document.getElementById('display');
    const number = parseInt(e.target.textContent);
    const decimal = e.target.textContent == '.';
    const hasDec = display.value.includes('.');
    
    
    // for key press:
    // const clicked = e.target.textContent;
    // const tapped = e.keyCode-48;
    // 142 for .
    // console.log(e.keyCode-48);

    
    // increase the count by 1 if a number has been clicked
    if (!isNaN(number)) count++;

    // - - - - -
    // clear display
    // - if operation button pressed last (data-total) AND makeNumber hasnt just been run
    if (display.dataset.total.length > 0 && count < 2) display.value = '';

    // add number
    if (!isNaN(number)) display.value += number;

    // add decimal
    if (decimal==true && hasDec==false) display.value += '.';

    // clear button - switch AC to C
    if (display.value.length > 0) document.getElementById('clear').textContent = 'C';
    
    // make number fit on the display
    // - if overflows, shrink font size to fit

}




// perform operations ( + - * / )
function performOperation(e) {
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

    // 1st click
    if (display.dataset.total.length == 0) {
        // save display value
        display.dataset.total = display.value;
        // save operator value
        display.dataset.operator = e.target.textContent;
    }

    // 2nd click +
    else if (display.dataset.total.length > 0) {
        getTotal();
        // save operator value
        display.dataset.operator = e.target.textContent;
    }
    
    // reset count
    count = 0;

}





// get total
function getTotal(e) {

    // fired by = button and perform operation
    const display = document.getElementById('display');

    // = button
    if (e!==undefined) {
        e.preventDefault();
    }

    const val1 = display.dataset.total;
    const operator = display.dataset.operator;
    const val2 = display.value;
    const newTotal = eval(`${val1} ${operator} ${val2}`);

    // update with new total
    display.value = `${newTotal}`;
    display.dataset.total = newTotal;

    // Clear dataset AFTER above calculations if = button clicked
    // - required for performOperation to work correctly
    // - i.e. < = button> <operator button> clicked in succession
    if (e!==undefined) {
        display.dataset.total = '';
        display.dataset.operator = '';
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





// keys
// window.addEventListener('keydown', makeNumber);


