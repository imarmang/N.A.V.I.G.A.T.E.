function deleteAppointment(courseDate, courseTime){
    let confirmation = confirm("Are you sure you want to delete this appointment?");
    if (confirmation) {
        let delApp = {
            date: courseDate,
            time: courseTime
        };

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
}

// This method shows the appointment information
function showAppInfo(courseTitle, courseDate, courseTime, courseTutor) {
    let infoBox = $('<div class="course-info-box">' +
                        '<p class="text-lines" id="first-line"> Appointment Details </p>'+
                        '<p class="text-lines" id="second-line">' + courseTitle + '</p>' +
                        '<p class="text-lines" id="third-line"> Date: ' + courseDate + '</p>' +
                        '<p class="text-lines" id="fourth-line"> Time: ' + courseTime + '</p>' +
                        '<p class="text-lines" id="fifth-line"> Tutor: ' + courseTutor + '</p>' +
                        '<textarea class="sent-messages" readonly></textarea>' +
                        '<div class="course-info-buttons">' +
                        '<button class="app-info-button" id="appInfo-button">Close</button>' +
                        '<button class="app-info-button" id="attach-mess-button">Attach Message</button>' +
                        '<button class="app-info-button" id="delete-app-button">Delete' +
                        '</button>' +
                        '</div>'+
                  '</div>');
    $('body').append(infoBox);
    infoBox.animate({opacity: 1}, 500);
    $('.blur-container').css('pointer-events', 'none');
    infoBox.css('pointer-events', 'auto');

    getMessagesFromServer(courseDate, courseTime)

    // Calling the popup
    infoBox.find('#attach-mess-button').on('click', function() {
        showAttachMessage(courseDate, courseTime);
    });

    // Calling the deleteAppointment function
    infoBox.find('#delete-app-button').on('click', function() {
        deleteAppointment(courseDate, courseTime);
    });

    infoBox.find('#appInfo-button').on('click', function() {
        infoBox.fadeOut(function() {
            $(this).remove();
        });
        $('.blur-container').css('pointer-events', 'auto');
    });
}

// The box that appears after clicking the "Attach Message"
function showAttachMessage(courseDate, courseTime) {
    let appointmentMessage = $('.sent-messages').val()
    let attachMessage = $('<div class="attach-message-box">' +
                            '<p class="attach-message-title">Send a Message to your tutor</p>' +
                            '<textarea class="message-text" placeholder="Type your message here..." maxlength="1500"></textarea>' +
                            '<div class="message-buttons">' +
                            '<button class="attach-button" id="cancel-button">Cancel</button>' +
                            '<button class="attach-button" id="send-message">Send</button>' +
                            '</div>' +
                          '</div>');
    $('body').append(attachMessage);
    attachMessage.animate({opacity: 1}, 500);
    $('.course-info-box').css('pointer-events', 'none');
    attachMessage.css('pointer-events', 'auto');

    attachMessage.find('#send-message').on('click', function() {
        sendMessage(courseDate, courseTime);
    });

    $('.message-text').append(appointmentMessage);  // Append the message to the textarea

    attachMessage.find('#cancel-button').on('click', function() {
        attachMessage.fadeOut(function() {
            $(this).remove();
        });
        $('.course-info-box').css('pointer-events', 'auto');
    });
}

/* This code is responsible for sending messages from, the user to the server and vice versa, also to show the messages */
function sendMessage(courseDate, courseTime) {
    let appointmentMessage = $('.message-text').val()
    let appMessage = {
        date: courseDate,
        time: courseTime,
        message: appointmentMessage
    }

    fetch('/store_appointment_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appMessage),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Appointment message stored successfully') {
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
