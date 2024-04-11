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

document.addEventListener('DOMContentLoaded', function() {
    let firstDropdown = document.getElementById('firstDropdown');
    let secondDropdown = document.getElementById('secondDropdown');
    let datePicker = document.getElementById('datePicker');
    let thirdDropdown = document.getElementById('thirdDropdown');
    let fourthDropdown = document.getElementById('fourthDropdown');

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
                        option.value = course.Subject + ' ' + course.Course_ID;
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
            fourthDropdown.style.display = 'none';

            secondDropdown.value = '';
            datePicker.value = '';
            thirdDropdown.value = '';
            fourthDropdown.value = '';
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
            thirdDropdown.style.display = 'none';
            fourthDropdown.style.display = 'none';

            // Clearing all the values if we switch back to the Service Type
            datePicker.value = '';
            thirdDropdown.value = '';
            fourthDropdown.value = '';
        }

     });

    let globalData = null;

    // Checking if the chosen date is valid
    datePicker.addEventListener('input', function() {
        if (datePicker.value !== "") {
            // Make a POST request to the /get_subject_availability endpoint
            fetch('/get_subject_availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Creating the JSON based on how Brandon asked it to look like
                body: JSON.stringify({
                    day: this.value,
                    subject: secondDropdown.value
                }),
            })
            .then(response => response.json())
            .then(data => {

                globalData = data;  // Making this variable global for the thirdDropdown to access
                // Clear the thirdDropdown
                thirdDropdown.innerHTML = '';
                let count = 0;
                // Populate the thirdDropdown with the names of the tutors
                data.forEach(tutor => {
                if (tutor === "None available") {
                    let noOption = document.createElement('option');
                    noOption.value = "None available";
                    noOption.text = "None available";
                    thirdDropdown.appendChild(noOption);
                    // Clear the fourthDropdown
                    fourthDropdown.style.display = 'none';
                    fourthDropdown.value = '';
                    fourthDropdown.text = '';
                    count = 0;  // Reset the count

                } else {
                    // Create a default option
                    let option = document.createElement('option');
                    if (count === 0){
                        let chooseOption = document.createElement('option');
                        chooseOption.value = "Choose your tutor";
                        chooseOption.text = "Choose your tutor";
                        thirdDropdown.appendChild(chooseOption);
                        count++;
                    }
                    // Create the rest of the dropdown
                    option.text = tutor.tutor_name;
                    option.value = tutor.tutor_name;
                    thirdDropdown.appendChild(option);
                }
                });

                // Show the thirdDropdown
                thirdDropdown.style.display = 'block';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            thirdDropdown.style.display = 'none';
            fourthDropdown.style.display = 'none';
        }
    });

    thirdDropdown.addEventListener('change', function() {
        if (thirdDropdown.value !== "Choose your tutor") {
            // Find the selected tutor from the previously fetched data
            let selectedTutor = globalData.find(tutor => tutor.tutor_name === thirdDropdown.value);

            // Clear the fourthDropdown
            fourthDropdown.innerHTML = '';

            let chooseOption = document.createElement('option');
            chooseOption.value = "Choose a timeslot";
            chooseOption.text = "Choose a timeslot";
            fourthDropdown.appendChild(chooseOption);
            // Populate the fourthDropdown with the available times of the selected tutor
            selectedTutor.tutor_times.forEach(time => {
                let option = document.createElement('option');
                option.value = time;
                option.text = time;
                fourthDropdown.appendChild(option);
            });

            // Show the fourthDropdown
            fourthDropdown.style.display = 'block';
        } else {
            fourthDropdown.style.display = 'none';
        }
    });
});