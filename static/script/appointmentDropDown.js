// This is for the appointment dropdowns
document.addEventListener('DOMContentLoaded', function() {
    let firstDropdown = document.getElementById('firstDropdown');
    let secondDropdown = document.getElementById('secondDropdown');
    let datePicker = document.getElementById('datePicker');
    let thirdDropdown = document.getElementById('thirdDropdown');
    let fourthDropdown = document.getElementById('fourthDropdown');
    let createBtn = document.getElementById('createBtn');

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
            createBtn.style.display = 'none';


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
                minDate: new Date().fp_incr(1), // Set the minimum date to tomorrow
            });
        }else{
            datePicker.style.display = 'none';
            thirdDropdown.style.display = 'none';
            fourthDropdown.style.display = 'none';
            createBtn.style.display = 'none';


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
            createBtn.style.display = 'none';

            thirdDropdown.value = '';
            fourthDropdown.value = '';

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
            createBtn.style.display = 'none';

            fourthDropdown.value = '';

        }
    });

    fourthDropdown.addEventListener('change', function() {
        if (fourthDropdown.value !== "Choose a timeslot") {
            createBtn.style.display = 'block';
        } else {
            createBtn.style.display = 'none';
        }
    });
});