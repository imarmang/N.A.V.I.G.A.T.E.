// Function used in main page to toggle the main menu
const sideBar = document.querySelector('.side-bar');
const toggleBtn = document.querySelector('.toggle-btn');


toggleBtn.addEventListener('click', () => {
    sideBar.classList.toggle('active');
});

