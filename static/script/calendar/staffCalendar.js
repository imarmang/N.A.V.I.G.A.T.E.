$(document).ready(function() {
    fetch('/get_tutor_appointments',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(appointments => {
            console.log(appointments);
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

       // eventClick: function (event) {
       //
       //      // Show the details of the created event here, called from the calendar.js file
       //      showAppInfo(event.title, event.start.format('YYYY-MM-DD'), event.start.format('HH:mm'), event.tutor);
       //  },
       events: appointments.map(appointment => ({
            title: appointment.Subject + ' - ' + appointment.Course,
            start: appointment.Appointment_date,
            tutor: appointment.Tutor,
            }))
        });
    })
    .catch(error => {
        console.error('Error fetching appointments:', error);
    });
});