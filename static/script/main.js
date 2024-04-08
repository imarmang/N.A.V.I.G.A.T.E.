var inBtn = document.getElementById("signInBtn"); // a
var upBtn = document.getElementById("signUpBtn");  // b
var login = document.getElementById("login");  // x
var register = document.getElementById("register");  // y
var courses = document.getElementById("courses-container");

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
}

// homeFunction transition
function homeFunction() {
    var i = document.getElementById("navMenu");

    if (i.className === "nav-menu") {
      i.className += " responsive";
    } else {
      i.className = "nav-menu";
    }
}
