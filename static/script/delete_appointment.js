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
        .then(data => {
            if (data.message === 'Appointment deleted successfully') {
                // Reload the page after successful deletion
                location.reload();
            } else {
                // Handle error
                console.error('Error:', data.message);
            }
        })

        .catch(error => {
            console.error('Error:', error);
        });
}

// This method shows the appointment information
function showAppInfo(courseTitle, courseDate, courseTime, courseTutor) {
    let infoBox = $('<div class="course-info-box">' +
                        '<p class="firstLine" id="firstLine"> Appointment Details </p>'+
                        '<p class="secondLine" id="secondLine">' + courseTitle + '</p>' +
                        '<p class="thirdLine" id="thirdLine"> Date: ' + courseDate + '</p>' +
                        '<p class="fourthLine" id="fourthLine"> Time: ' + courseTime + '</p>' +
                        '<p class="fifthLine" id="fifthLine"> Tutor: ' + courseTutor + '</p>' +
                        '<div class="courseInfoButtons">' +
                        '<a href="#" class="appInfo-button">Close</a>' +
                        '<button class="deleteApp-button" onclick="deleteAppointment(\'' + courseDate + '\', \'' + courseTime + '\')">Delete' +
                        '</button>' +
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
}
