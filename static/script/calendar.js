 //  Date picker function
$(document).ready(function () {
    $(function () {
        $('#datepicker').
            datepicker();
        });
    }) 
 
$(document).ready(function () {
    // Fetch the appointment data from the Flask route
    fetch('/get_appointments')
        .then(response => response.json())
        .then(appointments => {
                // Initialize the calendar with the fetched appointments
            $('.calendar').fullCalendar({
                header: {
                        left: 'month, agendaWeek, agendaDay, list',
                        center: 'title',
                        right: 'prev, today, next'
                    },
                buttonText: {
                        today: 'Today',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        list: "List"
                    },

                eventClick: function(event) {
                // Show the details of the created event here
                alert('Event: ' + event.title);
                },
                events: appointments.map(appointment => ({
                        title: appointment.Subject + ' - ' + appointment.Course,
                        start: appointment.Appointment_date,
                        // You can add more properties here if your appointment object contains them
                    }))
                });
            })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
    }
);


