/**********Random ID Generation*/
function getRandomId() {
    return (Date.now()*Math.random()).toFixed(0)
}

let  sampleEvents = [
    {id: getRandomId(), title: "React Lab Exam", description:"lorem ipusm lorem", startDateTime: new Date(`April ${new Date().getDate()}, 2020 23:59:00`) }, //today
    {id: getRandomId(), title: "Analytics Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date(`April ${new Date().getDate()}, 2020 02:58:00`) },//today
    {id: getRandomId(), title: "Maven Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date(`April ${new Date().getDate()+2}, 2020 23:57:00`) },//today
    {id: getRandomId(), title: "Maven Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date(`April ${new Date().getDate()+2}, 2020 23:57:00`) },//today
    {id: getRandomId(), title: "Maven Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date(`April ${new Date().getDate()+2}, 2020 23:57:00`) },//today
    {id: getRandomId(), title: "Maven Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date(`April ${new Date().getDate()+2}, 2020 23:57:00`) },//today
    {id: getRandomId(), title: "SEPQM Lab Exam", description:"lorem lorem ipusm ", startDateTime: new Date("April 25, 2020 11:13:00") } //Another day
]

let timerPromise // Live Remaining Time Update Promise
let mySound // Altert Tone init obj

app.controller( 'OrganizerController', ['$scope' ,'$interval', ($scope,$interval) => {
    //All events
    $scope.events = sampleEvents

    //Events occurring today
    $scope.events_today = []

    //Today Date Value
    $scope.today = new Date()


    //Init call for Today's Events
    $scope.syncTodayEventAtStart = ()=>{
        setUpReminderAudio()
        $scope.checkForEventsToday();
        $scope.UpdateEventsToday();
        $scope.checksForEventsForCalendarDate();
    }

    // Loads today's events
    $scope.checkForEventsToday = () => {
        $scope.events_today = $scope.events.filter( event => {
            console.log("this.event: "+ event.startDateTime.toDateString() + " #Today: "+$scope.today.toDateString())
            return event.startDateTime.toDateString()  === $scope.today.toDateString()
        })
    }

    //Update All Events based on live time
    $scope.UpdateEventsToday = () =>{
        timerPromise = $interval( function (){
            $scope.events = $scope.events.map(function(event) {
                let milliseconds = event.startDateTime.getTime() - new Date().getTime();

                let h,m,s;
                h = Math.floor(milliseconds/1000/60/60);
                m = Math.floor((milliseconds/1000/60/60 - h)*60);
                s = Math.floor(((milliseconds/1000/60/60 - h)*60 - m)*60);

                //Before 1 hour reminder
                if( h === 1 && m === 0 && s === 0){
                    mySound.play({loops:3})// Play Reminder Audio
                    alertify.alert("Event Reminder( 1 hour remaining )",`Event : ${event.title } is due on ${event.startDateTime.toLocaleTimeString()}`,
                        function(){
                            alertify.success('Will be notified again within an hour..')
                        });
                    mySound.stop()
                }


                if( (h === 0 && m === 0 && s ===  0 ) || (h < 0) ){
                    event.remainingTime = 'Expired'
                    // Last Reminder. Expiring now
                    $interval.cancel(timerPromise)
                    setTimeout( function () {
                        mySound.play({loops:3})// Play Reminder Audio
                    },500)
                    alertify.confirm("Event Reminder",`Event : ${event.title } is Expiring.`+"This event should be deleted now. Do you want to delete now ?",
                        function(){
                            setTimeout( function () {
                                $scope.removeEvent(event.id)
                            },500)
                            mySound.stop()
                            setTimeout( function () {
                                $scope.UpdateEventsToday()
                            },4000)

                        },
                        function(){
                            mySound.stop()
                            $scope.UpdateEventsToday()
                            alertify.error('Expired event deletion Cancelled')
                    });
                }
                else{
                    event.remainingTime = `Ends in: ${h}h ${m}m ${s}s`
                }
                return event;
            });
        }, 1000)

    }

    //Adding a new event to events
    $scope.addEvent = () => {
        let newItem = {
            id: getRandomId(),
            title:      $scope.title,
            description:$scope.description,
            startDateTime: $scope.startDateTime
        }
        $scope.events.push(newItem);
        $scope.title = ''
        $scope.description = ''
        $scope.startDateTime = ''
        console.log($scope.events)
        $scope.checkForEventsToday()
        $scope.checksForEventsForCalendarDate();

    };

    //Deleting an event from all events
    $scope.removeEvent = (id) => {
        alertify.confirm(`Delete Confirmation `,"Are you sure want to delete ?",
            function(){
                let oldList = $scope.events;
                $scope.events = [];
                angular.forEach(oldList, (event) => {
                    if(event.id !== id ) $scope.events.push(event);
                    console.log("Deleted: "+event.id)
                });
                $scope.checkForEventsToday();
                $scope.checksForEventsForCalendarDate();
                alertify.success('Deleted Event');
            },
            function(){
                alertify.error('Cancelled');
            });
    }

    /************************Selecting Features**********************************/


    $scope.selectItem = (id) => {
        $scope.selectedEvent = $scope.events.filter(function (entry) { return entry.id === id; })[0];
        $scope.updatingEvent = angular.copy($scope.selectedEvent);
        alertify.notify("Event :" + $scope.selectedEvent.title + " Selected")
    }

    //Updating the modified event
    $scope.updateEvent = function() {
        // $scope.selectedEvent = angular.copy($scope.updatingEvent);
        $scope.events = $scope.events.map(function(event) {
            if($scope.updatingEvent.id === event.id){
                event = $scope.updatingEvent
            }
            return event
        })
        $interval.cancel(timerPromise)
        $scope.syncTodayEventAtStart()
        alertify.success("Updated")
    }

    /************************Calender Features**********************************/
    $scope.calendarDate = $scope.today
    $scope.events_on_calendar_date = [];

    // Loads  events of the selected date in Calendar
    $scope.checksForEventsForCalendarDate = () => {
        $scope.events_on_calendar_date = $scope.events.filter( event => {
            console.log("this.event: "+ event.startDateTime.toDateString() + " #Calender: "+$scope.calendarDate.toDateString())
            return event.startDateTime.toDateString() === $scope.calendarDate.toDateString()
        })
    }



}])

function setUpReminderAudio() {

    mySound = soundManager.createSound({
        id: 'aSound',
        url: 'https://bigsoundbank.com/UPLOAD/mp3/0177.mp3'
    });
}