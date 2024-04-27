$(document).ready(function() {
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
    });
});