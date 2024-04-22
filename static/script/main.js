let inBtn = document.getElementById("signInBtn"); // a
let upBtn = document.getElementById("signUpBtn");  // b
let login = document.getElementById("login");  // x
let register = document.getElementById("register");  // y
let courses = document.getElementById("courses-container");
let cont_btn = document.getElementById("cont_btn");

// Helper function to handle transitions
function handleTransition(element, position, opacity) {
    element.style.right = position;
    element.style.opacity = opacity;
}

// Sign up/Register function transition
function signUp() {
    handleTransition(login, "-510px", "0");
    handleTransition(register, "5px", "1");
    handleTransition(courses, "-520px", "0");
    inBtn.className = "btn";
    upBtn.className += " white-btn";
}

// Continue to the choosing courses
function continueBtn(){
    handleTransition(login, "-520px", "0");
    handleTransition(register, "-520px", "0");
    handleTransition(courses, "5px", "1");
}

// Sign In/Login function transition
function signIn() {
    handleTransition(login, "4px", "1");
    handleTransition(register, "-520px", "0");
    handleTransition(courses, "-520px", "0");
    inBtn.className += " white-btn";
    upBtn.className = "btn";

    // Reset the input fields
    firstInput.value = "";
    secondInput.value = "";
    thirdInput.value = "";
    fourthInput.value = "";
    fifthInput.value = "";
    cont_btn.style.visibility = "hidden";
    window.resetCustomSelects();
}

// homeFunction transition
function homeFunction() {
    let i = document.getElementById("navMenu");

    if (i.className === "nav-menu") {
      i.className += " responsive";
    } else {
      i.className = "nav-menu";
    }
}

// Checking if all the registration inputs are filled so the Continue button occurs
let firstInput = document.getElementById("firstName");
let secondInput = document.getElementById("lastName");
let thirdInput = document.getElementById("nNumber");
let fourthInput = document.getElementById("email");
let fifthInput = document.getElementById("password");

function checkInputs() {
    return firstInput.value.trim() !== "" &&
        secondInput.value.trim() !== "" &&
        thirdInput.value.trim() !== "" &&
        fourthInput.value.trim() !== "" &&
        fifthInput.value.trim() !== "";
}

function updateButtonVisibility() {
    if (checkInputs()) {
        cont_btn.style.visibility = "visible";
    } else {
        cont_btn.style.visibility = "hidden";
    }
}

// Add event listeners to all input fields
firstInput.addEventListener("input", updateButtonVisibility);
secondInput.addEventListener("input", updateButtonVisibility);
thirdInput.addEventListener("input", updateButtonVisibility);
fourthInput.addEventListener("input", updateButtonVisibility);
fifthInput.addEventListener("input", updateButtonVisibility);