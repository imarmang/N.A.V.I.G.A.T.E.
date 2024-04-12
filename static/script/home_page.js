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

// This method shows the appointment information
function showCourseInfo(courseInfo) {
    let infoBox = $('<div class="course-info-box">' +
                        '<p class="firstLine"> Appointment Details </p>'+
                        '<p class="secondLine">' + courseInfo + '</p>' +
                        '<div class="two-buttons">' +
                        '<a href="#" class="appInfo-button">Close</a>' +
                        '<a href="#" class="deleteApp-button">Delete</a>' +
                        '</div>'+
                  '</div>');
    $('body').append(infoBox);
    infoBox.fadeIn();

    infoBox.find('.appInfo-button').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
    });
}

// This function calls the delete_appointment route to delete the appointment from the DB which would be reflected on the front end calendar
// Assuming the delete button has a class name of 'deleteApp-button'
let deleteButtons = document.querySelectorAll('.deleteApp-button');

deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Assuming the appointment date and time are stored as data attributes on the button
        let appointmentDate = this.dataset.date;
        let appointmentTime = this.dataset.time;

        fetch('/delete_appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([appointmentTime, appointmentDate]),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // You can add code here to remove the appointment from the calendar or update the UI in some other way
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});

