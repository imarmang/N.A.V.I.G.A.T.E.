from flask import Flask, render_template, redirect, url_for, request, session, jsonify

from flask_bcrypt import generate_password_hash, check_password_hash

# This allows me to use my custom decorator with multiple functions and decorators
from functools import wraps

# Database access
import pymongo

# Datetime conversion
from datetime import datetime


app = Flask(__name__)


# Database connection to fetch students database for student page
client = pymongo.MongoClient("mongodb+srv://NAVIGATE:MQc0UmcHj4KZE3tP@navigate.l4xvkly.mongodb.net/")
database = client["NVGT"]
students_collection = database["Students"]
staff_collection = database["Staff"]


# NOT USING THIS FOR SECURITY RIGHT NOW
# Later, this will be a randomly assigned key. I have it static for testing purposes
app.secret_key = 'testing'


# Decorator to check if user is logged in. if not, they are redirected to log in page
def check_logged_in(func):
    @wraps(func)
    def wrapper_func():
        if 'n_number' not in session:
            return redirect(url_for('student_login'))
        return func()
    return wrapper_func


# Login page
@app.route('/', methods=['GET', 'POST'])
def student_home():

    # If structure to get the username and password and pass it into the check function
    if request.method == 'POST':
        # Variables to hold username and password
        username = request.form['username']
        password = request.form['password']

        # If the credentials are good, then go to logged in page. Else, do nothing for now
        if login_successful(username, password):
            return redirect(url_for('logged_in_home'))
        else:
            pass

    return render_template('student_login.html')


# Function to handle checking the username and password. Will check the database.
def login_successful(username, password):
    # Check if username or password is empty
    if not username or not password:
        return False

    # Finds the student that matches the username and store the corresponding database table
    student = students_collection.find_one({'student_info.email': username})

    # Checks if the username and password match the database
    if student["student_info"]["email"] == username and check_password_hash(student["student_info"]["password"], password):
        session['n_number'] = student['student_info']['nNumber']
        return True
    else:
        return False


# Logout route
@app.route('/logout')
def logout():
    session.pop('n_number', None)
    return render_template('student_login.html')


# Flask Route to handle account creation
@app.route('/create_account', methods = ['POST', 'GET'])
def create_account():

    # If structure to determine if POST was used
    if request.method == 'POST':

        userInfoRequest = request.json

        # I request the email up here to check if it is already in use
        email = userInfoRequest['user_info'][3]

        # Determine if email is already in use
        # TODO let user know it is already in use
        if email_already_used(email):
            return render_template('student_login.html')

        # Only add user if email is unique
        else:

            # Get information from the inputs in the HTML page
            firstName = userInfoRequest['user_info'][0]
            lastName = userInfoRequest['user_info'][1]
            password = userInfoRequest['user_info'][4]
            nNumber = userInfoRequest['user_info'][2]

            student_courses = userInfoRequest['courses']

            # Encrypt password before sending it into the database
            pw_hash = generate_password_hash(password).decode('utf-8')

            # Input information into database by wrapping it in a dictionary
            inputDict = {'courses': student_courses, 'first_name': firstName, 'last_name': lastName, 'student_info': {'email': email, 'password': pw_hash, 'nNumber': nNumber}}

            students_collection.insert_one(inputDict)

            # Redirect to the logged in page after account creation on front-end because it expects JSON response
            return jsonify({'message': 'Account created successfully'}), 200


# Function to check if email is already used
def email_already_used(email):
    if students_collection.find_one({'student_info.email': email}) is None:
        return False
    else:
        return True


# Accessing the staff home
@app.route('/staff_login')
def staff_login():
    return render_template('staff_login.html')


# Home page WIP
@app.route('/logged_in_home')
@check_logged_in
def logged_in_home():
    return render_template('logged_in_home.html')


@app.route('/fetch_tutor_info')
@check_logged_in
def fetch_tutor_info():
    tutor_info = staff_collection.find_one({'student_info'})

    return render_template('logged_in_home.html', tutor_info=tutor_info)


@app.route('/create_appointment', methods = ['GET', 'POST'])
@check_logged_in
def create_appointment():

    # Retrieving N# from session
    nNumber = session.get('n_number')

    # Putting this in here for now
    appointment_collection = database["Appointments"]

    if request.method == 'POST':

        # We need the date and course to make the appointment
        # Not sure if these are going to be using forms. I have it as this for now

        inputDict = {
            'nNumber': nNumber,
            'date': request.form['Date'],
            'Subject': request.form['Subject'],
            'Course': request.form['course_ID']
        }

        appointment_collection.insert_one(inputDict)


# To be used for creating appointments using the calendar.
@app.route('/get_appointments', methods = ['GET'])
def calendar():
    appointment_collection = database["Appointments"]
    appointments = []

    # Only pull the columns I need from DB.
    for appointment in appointment_collection.find({'nNumber': session['n_number']},
                                                   {'_id': 0,
                                                    'Appointment_date': 1,
                                                    'Course': 1,
                                                    'Subject': 1}):

        appointments.append(appointment)

    # Returns the appointments list as JSON object
    return jsonify(appointments)


@app.route('/courses', methods=['GET'])
def get_courses():
    courses_collection = database["Courses"]

    # retrieves all courses
    courses = courses_collection.find({}, {'_id': 0,
                                           'Course_ID': 1,
                                           'Subject': 1})
    # creates list of courses formatted as dicts
    courses_list = [x for x in courses]
    return jsonify(courses_list)


# Used to load student courses in dropdown when making an appointment
@app.route('/get_student_courses', methods=['GET'])
def get_student_courses():

    # retrieves all courses for the currently logged in student
    student_courses = students_collection.find_one({'student_info.nNumber': session['n_number']})['courses']

    # creates list of courses formatted as dicts
    # I parse through the courses to get the course ID and subject
    student_courses_list = [{'Course_ID': course.split(' ')[1], 'Subject': course.split(' ')[0]} for course in
                            student_courses]

    return jsonify(student_courses_list)


# Used to load student courses from dropdown menu into DB (Saving here as route to use for modifying courses later)
@app.route('/store_selected_courses', methods=['POST'])
def store_selected_courses(nNumber):
    selected_courses = request.json['selected_courses']

    # Needed to store the selected courses in the student's database
    students_collection.update_one({'student_info.nNumber': nNumber},
                                   {'$set': {'courses': selected_courses}})


# Should be good?
@app.route('/store_appointment_message', methods=['POST'])
def store_appointment_message():
    appointment_collection = database["Appointments"]

    # Getting JSON response and extract data
    data = request.json
    time = data[0]
    date = data[1]
    message = data[2]

    # Find appointment to store message in
    appointment = appointment_collection.find_one({
        'Appointment_date': date,
        'Appointment_time': time,
        'nNumber': session['n_number']
    })

    # Check if the appointment exists
    if appointment is not None:
        # If the appointment exists, store message in the appointment
        # Update the appointment with the message
        appointment_collection.update_one({'_id': appointment['_id']}, {'$set': {'message': message}})
        return jsonify({'Appointment message stored successfully'}), 200
    else:
        # If the appointment does not exist, return an error message
        return jsonify({'message': 'Appointment not found'}), 404


# Used to send all messages to front-end for displaying
@app.route('/get_appointment_messages', methods=['GET'])
def get_appointment_messages():
    appointment_collection = database["Appointments"]

    # retrieves all messages for the currently logged in student
    appointment_messages = appointment_collection.find({'nNumber': session['n_number']})

    # creates list of messages from DB
    appointment_messages_list = [x for x in appointment_messages]

    return jsonify(appointment_messages_list)


# Deletes an appointment from the DB
# If the appointment does not exist, returns an error message to front-end
@app.route('/delete_appointment', methods=['POST'])
def delete_appointment():
    # Extract data from the JSON request
    data = request.json
    time = data[0]
    date = data[1]

    # Get the appointment collection
    appointment_collection = database["Appointments"]

    # Find the appointment that matches the date, time, and nNumber
    appointment = appointment_collection.find_one({
        'Appointment_date': date,
        'Appointment_time': time,
        'nNumber': session['n_number']
    })

    # Check if the appointment exists
    if appointment is not None:
        # If the appointment exists, delete it
        appointment_collection.delete_one({'_id': appointment['_id']})
        return jsonify({'message': 'Appointment deleted successfully'}), 200
    else:
        # If the appointment does not exist, return an error message
        return jsonify({'message': 'Appointment not found'}), 404


# Returns availability of all tutors and time for a specific subject on a specific date and specific time to front-end
# Format is: [{"tutor_name": "Brandon DeCelle", "tutor_times": ["09:00", "10:00", "11:00"]}, {"tutor_name": "Carlos Acacio", "tutor_times": ["13:00", "14:00", "15:00"]}
@app.route('/get_subject_availability_at_specific_time', methods=['POST'])
def get_subject_availability_at_specific_time():

    # Get the specific day and subject from the JSON request
    # JSON response should be in the form of {"subject": "CSIS 2101", "date": "mm dd yyyy", "time": "hh:mm"}
    data = request.json
    specific_subject = data['subject']
    specific_date = data['date']
    specific_time = data['time']

    # Convert the date string to a datetime object and get the day of the week
    date_object = datetime.strptime(specific_date, "%m %d %Y")
    specific_day = date_object.strftime("%A")

    # Get the appointment collection
    appointment_collection = database["Appointments"]

    # Retrieve all the tutors
    tutors = staff_collection.find({})

    # Initialize an empty list to store the tutor availability
    tutor_availability = []

    # BASICALLY THIS IS A LONG EXPLANATION
    # 1. Check if the tutor teaches the specific subject
    # 2. Check if the tutor is available on the specific day
    # 3. Check if the tutor is available at the specific time
    # 4. Check if the tutor has an appointment at the specific time
    # 5. If no appointment, add the tutor's name and time to the tutor availability
    # 6. Return the tutor availability as a JSON response
    # Lots of nested loops BUT each loop can only have like 7 to 10 iterations MAX
    for tutor in tutors:

        # Check if the tutor teaches the specific subject
        if specific_subject in tutor['Courses']:

            # Initialize an empty list to store the times for the tutor
            tutor_times = []

            # For each day in the tutor's availability
            for day, times in tutor['Availability'].items():

                # Check if the day matches the specific day
                if day == specific_day:

                    # For each time slot on this day
                    for time_slot in times['time_slots']:

                        # Check if the time slot matches the specific time
                        if time_slot['start_time'] == specific_time:

                            # Check if an appointment for this time and tutor already exists
                            existing_appointment = appointment_collection.find_one({
                                'Appointment_date': specific_date,
                                'Appointment_time': specific_time,
                                'tutor_name': tutor['first_name'] + ' ' + tutor['last_name']
                            })

                            # If no existing appointment, add the start time to the tutor's times
                            if existing_appointment is None:
                                tutor_times.append(specific_time)

            # If the tutor has times on the specific day, add them to the tutor availability
            if tutor_times:
                tutor_availability.append({
                    'tutor_name': tutor['first_name'] + ' ' + tutor['last_name'],
                    'tutor_times': tutor_times
                })

    # Return the tutor availability as JSON response
    return jsonify(tutor_availability)


# This route is the same as get_subject_availability_at_specific_time but without the specific time
@app.route('/get_subject_availability', methods=['POST'])
def get_subject_availability():
    # Get the specific day and subject from the JSON request
    data = request.json
    specific_subject = data['subject']
    specific_day = data['day']

    # Get the appointment collection
    appointment_collection = database["Appointments"]

    # Retrieve all the tutors
    tutors = staff_collection.find({})

    # Initialize an empty list to store the tutor availability
    tutor_availability = []

    for tutor in tutors:
        # Check if the tutor teaches the specific subject
        if specific_subject in tutor['Courses']:
            # Initialize an empty list to store the times for this tutor
            tutor_times = []

            # For each day in the tutor's availability
            for day, times in tutor['Availability'].items():
                # Check if the day matches the specific day
                if day == specific_day:
                    # For each time slot on this day
                    for time_slot in times['time_slots']:
                        # Check if an appointment for this time and tutor already exists
                        existing_appointment = appointment_collection.find_one({
                            'Appointment_date': specific_day,
                            'Appointment_time': time_slot['start_time'],
                            'tutor_name': tutor['first_name'] + ' ' + tutor['last_name']
                        })

                        # If no existing appointment, add the start time to the tutor's times
                        if existing_appointment is None:
                            tutor_times.append(time_slot['start_time'])

            # If the tutor has times on the specific day, add them to the tutor availability
            if tutor_times:
                tutor_availability.append({
                    'tutor_name': tutor['first_name'] + ' ' + tutor['last_name'],
                    'tutor_times': tutor_times
                })

    print(tutor_availability)

    # Return the tutor availability as a JSON response
    return jsonify(tutor_availability)


if __name__ == '__main__':
    app.run(debug=True)
