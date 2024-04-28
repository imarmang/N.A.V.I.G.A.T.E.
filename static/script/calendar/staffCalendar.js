$(document).ready(function() {
    fetch('/get_tutor_appointments',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(appointments => {
            $('.calendar').fullCalendar({
                header: {
                    left: 'month, agendaWeek, agendaDay',
                    center: 'title',
                    right: 'prev, today, next'
                },
                buttonText: {
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    prev: 'Prev',
                    next: 'Next'
                },

       eventClick: function (event) {

            // Show the details of the created event here, called from the calendar.js file
            showAppTutorInfo(event.title, event.start.format('YYYY-MM-DD'), event.start.format('HH:mm'), event.student);
        },
       events: appointments.map(appointment => ({
            title: appointment.Subject + ' - ' + appointment.Course,
            start: appointment.Appointment_date,
            student: appointment.student_name,
            }))
        });
    })
    .catch(error => {
        console.error('Error fetching appointments:', error);
    });
});

function showAppTutorInfo(courseTitle, courseDate, courseTime, student) {
    let infoBox = $('<div class="course-info-box">' +
                        '<p class="text-lines" id="first-line"> Appointment Details </p>'+
                        '<p class="text-lines" id="second-line">' + courseTitle + '</p>' +
                        '<p class="text-lines" id="third-line"> Date: ' + courseDate + '</p>' +
                        '<p class="text-lines" id="fourth-line"> Time: ' + courseTime + '</p>' +
                        '<p class="text-lines" id="fifth-line"> Student: ' + student + '</p>' +
                        '<textarea class="sent-messages" readonly></textarea>' +
                        '<div class="course-info-buttons">' +
                        '<button class="app-info-button" id="appInfo-button">Close</button>' +
                        '</button>' +
                        '</div>'+
                  '</div>');
    $('body').append(infoBox);
    infoBox.animate({opacity: 1}, 500);
    $('.blur-container').css('pointer-events', 'none');
    infoBox.css('pointer-events', 'auto');

    getMessagesFromServer(courseDate, courseTime);

    infoBox.find('#appInfo-button').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
        $('.blur-container').css('pointer-events', 'auto');
    });
}

// Fetching already sent messages from the server to textarea in the showAppInfo method
function getMessagesFromServer(courseDate, courseTime) {
    fetch('/get_appointment_messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: courseDate,
            time: courseTime
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            $('.sent-messages').append(data.message + '\n'); // Append the message to the textarea
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}