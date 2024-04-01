// Calendar jQuery
$(document).ready(function () {
$(".calendar").fullCalendar({
    // selectable: true,
    // selectHelper: true,
    // select: function(){
    //     alert("Clicked!")
    // },
    header:
    {
        left: 'month, agendaWeek, agendaDay, list',
        center: 'title',
        right: 'prev, today, next',

    },
    buttonText:
    {
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        list: "List",
    },

    events: [
            {
                title: 'Arman',
                start: '2024-03-29T09:00',
                end: '2024-03-29T14:00',
            },
            {
                title: 'test2',
                start: '2024-03-29T16:00',
                end: '2024-03-29T18:00',
            }
        ]
    });
});
