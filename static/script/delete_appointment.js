function deleteAppointment(courseDate, courseTime){
           let delApp = {
            date: courseDate,
            time: courseTime
        };

        console.log("Appointment to be deleted " + JSON.stringify(delApp));

        fetch('/delete_appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(delApp),
        })
        .then(response => response.json())

        .catch(error => {
            console.error('Error:', error);
        });
}



// This method shows the appointment information
function showAppInfo(courseTitle, courseDate, courseTime, courseTutor) {
    let infoBox = $('<div class="course-info-box">' +
                        '<p class="firstLine"> Appointment Details </p>'+
                        '<p class="secondLine">' + courseTitle + '</p>' +
                        '<p class="thirdLine"> Date: ' + courseDate + '</p>' +
                        '<p class="fourthLine"> Time: ' + courseTime + '</p>' +
                        '<p class="fifthLine"> Tutor: ' + courseTutor + '</p>' +
                        '<div class="courseInfoButtons">' +
                        '<a href="#" class="appInfo-button">Close</a>' +
                        '<button class="deleteApp-button">Delete</button>' +
                        '</div>'+
                  '</div>');
    $('body').append(infoBox);
    // infoBox.fadeIn();
    infoBox.animate({opacity: 1}, 500);
    $('.blur-container').css('pointer-events', 'none');
    infoBox.css('pointer-events', 'auto');

    infoBox.find('.appInfo-button').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
        $('.blur-container').css('pointer-events', 'auto');
    });

    // This function calls the delete_appointment
    // route to delete the appointment from the DB
    // which would be reflected on the front end calendar
    infoBox.find('.deleteApp-button').on('click', function() {
        deleteAppointment(courseDate, courseTime);
    });
}
