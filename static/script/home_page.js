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
                        '<a href="#" class="appInfo-button">Close</a>' +
                        '<a href="#" class="appInfo-button">Delete</a>' +
                  '</div>');
    $('body').append(infoBox);
    infoBox.fadeIn();

    infoBox.find('.close-link').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let firstDropdown = document.getElementById('firstDropdown');
    let secondDropdown = document.getElementById('secondDropdown');
    let datePicker = document.getElementById('datePicker');
    let thirdDropdown = document.getElementById('thirdDropdown');
    let forthDropdown = document.getElementById('forthDropdown');

    firstDropdown.addEventListener('change', function() {
        let serviceType = this.value;
        if (serviceType === 'TTC') {
            fetch('/get_student_courses')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to retrieve student courses data');
                    }
                    return response.json();
                })
                .then(data => {
                    secondDropdown.innerHTML = '';
                    secondDropdown.style.display = 'block'; // equivalent to jQuery's .show()
                    // Create a default option
                    let chooseOption = document.createElement('option');
                    chooseOption.text = "Choose a course";
                    secondDropdown.appendChild(chooseOption);

                    data.forEach(course => {
                        let option = document.createElement('option');
                        option.value = course.Course_ID;
                        option.text = course.Subject + ' ' + course.Course_ID;
                        secondDropdown.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Display an error message to the user
                    alert('Failed to load student courses. Please try again later.');
                });
        } else {
            secondDropdown.style.display = 'none';
            datePicker.style.display = 'none';
            thirdDropdown.style.display = 'none';
        }
    });
    // Checking if the user chose the courses
    secondDropdown.addEventListener('change', function() {
        if (this.value !== 'Choose a course') {
            // Initialize the datePicker here
            datePicker.style.display = 'block';
            flatpickr(datePicker, {
                dateFormat: "m-d-y",
                onChange: function(selectedDates, dateStr) {
                    console.log("Date selected: ", dateStr);
                }
            });
        }else{
            datePicker.style.display = 'none';
        }

     });
    // Checking if the user chose a date
    datePicker.addEventListener('input', function() {
        thirdDropdown.style.display = this.value !== "" ? 'block' : 'none';
    });

    thirdDropdown.addEventListener('change', function() {
        forthDropdown.style.display = this.value !== 'Choose a time' ? 'block' : 'none';
    });
});