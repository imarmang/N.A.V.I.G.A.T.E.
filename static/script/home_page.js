// Helper function to toggle class 'active'
function toggleClass(element, className) {
    element.classList.toggle(className);
}

// Function used in main page to toggle the main menu
const sideBar = document.querySelector('.side-bar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click', () => {
    toggleClass(sideBar, 'active');
});

function toggle(){
    let blur = document.getElementById('blur');
    let popup = document.getElementById('popup');

    toggleClass(blur, 'active');
    toggleClass(popup, 'active');
}