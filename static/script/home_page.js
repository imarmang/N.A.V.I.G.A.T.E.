// Function used in main page to toggle the main menu
const sideBar = document.querySelector('.side-bar');
const toggleBtn = document.querySelector('.toggle-btn');


toggleBtn.addEventListener('click', () => {
    sideBar.classList.toggle('active');
});

function toggle(){
    var blur = document.getElementById('blur');
    blur.classList.toggle('active');

    var popup = document.getElementById('popup');
    popup.classList.toggle('active');
}

// Appear only if the Tutoring is chosen in the #popup
function showSecondDropdown(){
    var firstDropdown = document.getElementById("firstDropdown");
    var secondDropdown = document.getElementById("secondDropdown");

    if (firstDropdown.value === "TTC") {
        secondDropdown.style.display = "block";
    } else {
        secondDropdown.style.display = "none";
    }
}

// This method shows the appointment information
function showCourseInfo(courseInfo) {
    var infoBox = $('<div class="course-info-box">' +
                        '<p class="firstLine"> Appointment Details </p>'+
                        '<p class="secondLine">' + courseInfo + '</p>' +
                        '<a href="#" class="close-link">Close</a>' +
                  '</div>');
    $('body').append(infoBox);
    infoBox.fadeIn();

    infoBox.find('.close-link').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
    });
}