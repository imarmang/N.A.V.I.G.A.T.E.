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
    var blur = document.getElementById('blur');
    var popup = document.getElementById('popup');

    toggleClass(blur, 'active');
    toggleClass(popup, 'active');
}

// Appear only if the Tutoring is chosen in the #popup
function showSecondDropdown(){
    var firstDropdown = document.getElementById("firstDropdown");
    var secondDropdown = document.getElementById("secondDropdown");

    secondDropdown.style.display = firstDropdown.value === "TTC" ? "block" : "none";
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

$(document).ready(function() {
    $('#firstDropdown').change(function() {
        var serviceType = $(this).val();
        if (serviceType === 'TTC') {
            fetch('/get_student_courses')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to retrieve student courses data');
                    }
                    return response.json();
                })
                .then(data => {
                    var secondDropdown = $('#secondDropdown');
                    secondDropdown.empty();
                    secondDropdown.show();
                    data.forEach(course => {
                        secondDropdown.append('<option value="' + course.Course_ID + '">' + course.Subject + ' ' + course.Course_ID + '</option>');
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Display an error message to the user
                    alert('Failed to load student courses. Please try again later.');
                });
        } else {
            $('#secondDropdown').hide();
        }
    });
});