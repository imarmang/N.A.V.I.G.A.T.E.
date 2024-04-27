from flask import Flask, render_template, redirect, url_for, request, session, jsonify

from flask_bcrypt import generate_password_hash, check_password_hash

# This allows me to use my custom decorator with multiple functions and decorators
from functools import wraps

# Datetime conversion
from datetime import datetime

# Used to generate a random key for the session
import secrets

# Importing the database class
from database_class import Database

app = Flask(__name__)

# Database connection to fetch students database for student page
db = Database("mongodb+srv://NAVIGATE:MQc0UmcHj4KZE3tP@navigate.l4xvkly.mongodb.net/", "NVGT")
students_collection = db.get_collection("Students")
staff_collection = db.get_collection("Staff")
appointment_collection = db.get_collection("Appointments")

# Random key for session
app.secret_key = secrets.token_urlsafe(16)


# Decorator to check if user is logged in. if not, they are redirected to log in page
def check_logged_in(func):
    @wraps(func)
    def wrapper_func():
        if 'n_number' not in session and 'email' not in session:
            return redirect(url_for('student_login'))
        return func()

    return wrapper_func


# Used for post redirect get function to handle form auto submission issue.
@app.route('/student_login')
def student_login():
    return render_template('student_login.html')


# Login page
@app.route('/', methods=['GET', 'POST'])
def student_login_main():
    # If structure to get the username and password and pass it into the check function
    if request.method == 'POST':
        # Variables to hold username and password
        username = request.form['username']
        password = request.form['password']

        # If the credentials are good, then go to logged in page. Else, do nothing for now
        if login_successful_student(username, password):
            return redirect(url_for('student_home'))
        else:
            return redirect(url_for('student_login'))

    return render_template('student_login.html')


# Function to handle checking the username and password. Will check the database.
def login_successful_student(username, password):
    # Check if username or password is empty
    if not username or not password:
        return False

    # Finds the student that matches the username and store the corresponding database table
    student = db.find_one('Students', {'student_info.email': username})

    if student is None:
        return False

    # Checks if the username and password match the database
    elif student["student_info"]["email"] == username and check_password_hash(student["student_info"]["password"],
                                                                              password):
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
@app.route('/create_account', methods=['POST', 'GET'])
def create_account():
    # If structure to determine if POST was used
    if request.method == 'POST':

        userInfoRequest = request.json

        # I request the email up here to check if it is already in use
        email = userInfoRequest['user_info'][3]

        # Determine if email is already in use
        # TODO let user know it is already in use
        if email_already_used(email):
            return jsonify({'message': 'Email already in use'}), 403

        # Only add user if email is unique
        else:

            # Get information from the inputs in the HTML page
            firstName = userInfoRequest['user_info'][0]
            lastName = userInfoRequest['user_info'][1]
            password = userInfoRequest['user_info'][4]
            nNumber = userInfoRequest['user_info'][2]

            student_courses = userInfoRequest['courses']

            print("student_courses: ", student_courses)

            # Encrypt password before sending it into the database
            pw_hash = generate_password_hash(password).decode('utf-8')

            # Input information into database by wrapping it in a dictionary
            inputDict = {'courses': student_courses, 'first_name': firstName, 'last_name': lastName,
                         'student_info': {'email': email, 'password': pw_hash, 'nNumber': nNumber}}

            # students_collection.insert_one(inputDict)

            db.insert_one('Students', inputDict)

            # Redirect to the logged in page after account creation on front-end because it expects JSON response
            return jsonify({'message': 'Account created successfully'}), 200


# Function to check if email is already used
def email_already_used(email):
    if db.find_one('Students', {'student_info.email': email}) is None:
        return False
    else:
        return True


# Home page WIP
@app.route('/student_home')
@check_logged_in
def student_home():
    return render_template('student_home.html')


# DEPRECATED ROUTE BUT LEAVING IT IN FOR NOW
# @app.route('/get_appointment_info')
# @check_logged_in
# def get_appointment_info():
#
#     # Get JSON from front-end to get tutor's email (Could also be in form)
#     date = request.json['date']
#
#     # Get the appointment information
#     # appointment = appointment_collection.find_one({
#     #     'Appointment_date': date,
#     #     'nNumber': session['n_number']
#     #     })
#
#     appointment = db.find_one(
#         'Appointments',
#         {'Appointment_date': date,
#          'nNumber': session['n_number']
#          })
#
#     ret_dict = {
#         'date': appointment['Appointment_date'],
#         'time': appointment['Appointment_time'],
#         'subject': appointment['Subject'],
#         'course': appointment['Course'],
#         'tutor': appointment['Tutor'],
#         'message': appointment['message']
#     }
#
#     return jsonify(ret_dict)


@app.route('/create_appointment', methods=['GET', 'POST'])
@check_logged_in
def create_appointment():
    # Retrieving N# from session
    nNumber = session.get('n_number')

    # Get relevant information from the form
    course = request.form.get('secondDropdown')
    date = request.form.get('datePicker')
    tutor = request.form.get('thirdDropdown')
    time = request.form.get('fourthDropdown')
    # Need to get tutor email to store in the database

    print("time: ", time)
    print("date: ", date)
    print("course: ", course)
    print("tutor: ", tutor)

    # Split the string into a list
    course_subject_list = course.split(" ")

    # The first item in the list is subject
    subject = course_subject_list[0]

    # The second item in the list is course
    course = course_subject_list[1]

    # Combine the date and time into a single string then convert it to a datetime object to store in the database
    datetime_string = f"{date} {time}"

    datetime_object = datetime.strptime(datetime_string, "%m-%d-%y %H:%M")

    # Convert the datetime object to a string in the format "YYYY-MM-DDTHH:MM"
    formatted_datetime = datetime_object.strftime("%Y-%m-%dT%H:%M")

    # This if is kind of a relic of something else but keeping it because it does not hurt to have.
    if request.method == 'POST':

        # We need the date and course to make the appointment
        # Not sure if these are going to be using forms. I have it as this for now

        inputDict = {
            'nNumber': nNumber,
            'Appointment_date': formatted_datetime,
            'Appointment_time': time,
            'Subject': subject,
            'Course': course,
            'Tutor': tutor,
            'message': ''
        }

        print(inputDict)

        if request.method == 'POST':

            if db.find_one('Appointments', {'Appointment_date': formatted_datetime, 'nNumber': nNumber}) is None:

                # appointment_collection.insert_one(inputDict)
                db.insert_one('Appointments', inputDict)

                # If everything is successful reload page
                return redirect(url_for('student_home'))

            else:
                return redirect(url_for('student_home'))


# To be used for creating appointments using the calendar.
@app.route('/get_appointments', methods=['GET'])
def calendar():
    appointments = []

    # Only pull the columns I need from DB
    for appointment in db.find('Appointments',
                               {'nNumber': session['n_number']},
                               {'_id': 0,
                                'Appointment_date': 1,
                                'Course': 1,
                                'Subject': 1,
                                'Tutor': 1}):

        appointments.append(appointment)

    # Returns the appointments list as JSON object
    return jsonify(appointments)


@app.route('/courses', methods=['GET'])
def get_courses():
    courses_collection = db.get_collection("Courses")

    # retrieves all courses from the database
    courses = db.find('Courses',
                      {},
                      {'_id': 0,
                       'Course_ID': 1,
                       'Subject': 1})

    # creates list of courses formatted as dicts
    courses_list = [x for x in courses]
    print(courses_list)
    return jsonify(courses_list)


# Used to load student courses in dropdown when making an appointment
@app.route('/get_student_courses', methods=['GET'])
def get_student_courses():
    # retrieves all courses for the currently logged in student
    student_courses = db.find_one('Students', {'student_info.nNumber': session['n_number']})['courses']

    # creates list of courses formatted as dicts
    # I parse through the courses to get the course ID and subject
    student_courses_list = [{'Course_ID': course.split(' ')[1], 'Subject': course.split(' ')[0]} for course in
                            student_courses]

    return jsonify(student_courses_list)


# Used to load student courses from dropdown menu into DB (Saving here as route to use for modifying courses later)
@app.route('/store_selected_courses', methods=['POST'])
def store_selected_courses():
    selected_courses = request.json['selected_courses']

    nNumber = session['n_number']

    print(selected_courses)

    db.update_one('Students',
                  {'student_info.nNumber': nNumber},
                  {'$set': {'courses': selected_courses}})


# Should be good?
@app.route('/store_appointment_message', methods=['POST'])
def store_appointment_message():
    # Getting JSON response and extract data
    data = request.json
    date = data['date']
    time = data['time']
    message = data['message']

    # Convert date to format used in DB
    datetime_string = f"{date} {time}"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M")

    # Convert the datetime object to a string in the format "YYYY-MM-DDTHH:MM"
    formatted_datetime = datetime_object.strftime("%Y-%m-%dT%H:%M")

    appointment = db.update_one('Appointments',
                                {'Appointment_date': formatted_datetime,
                                 'Appointment_time': time,
                                 'nNumber': session['n_number']},
                                {'$set': {'message': message}})

    # Check if any documents were changed (Just 1 in this case)
    if appointment.modified_count > 0:
        return jsonify({'message': 'Appointment message stored successfully'}), 200
    else:
        # If the appointment does not exist, return an error message
        return jsonify({'message': 'Appointment not found'}), 404


# Used to send all messages to front-end for displaying
@app.route('/get_appointment_messages', methods=['POST'])
def get_appointment_messages():
    # Getting JSON response and extract data
    data = request.json
    date = data['date']
    time = data['time']

    print("date: ", date)
    print("time: ", time)

    # Convert date to format used in DB
    datetime_string = f"{date} {time}"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M")

    # Convert the datetime object to a string in the format "YYYY-MM-DDTHH:MM"
    formatted_datetime = datetime_object.strftime("%Y-%m-%dT%H:%M")

    appointment_cursor = db.find_one('Appointments',
                                     {'Appointment_date': formatted_datetime,
                                      'Appointment_time': time,
                                      'nNumber': session['n_number']})

    # Extracts message from DB entry
    appointment_message = appointment_cursor['message']

    print(appointment_message)

    # If statement depending on if the appointment exists
    if appointment_cursor is None:
        # If the appointment does not exist, return an error message
        return jsonify({'error': 'Appointment not found'}), 404

    else:
        # If the appointment exists, return the message
        return jsonify({'message': appointment_cursor['message']}), 200


# Deletes an appointment from the DB
# If the appointment does not exist, returns an error message to front-end
@app.route('/delete_appointment', methods=['POST'])
def delete_appointment():
    # Extract data from the JSON request
    data = request.json
    date = data['date']
    time = data['time']

    print("date: ", date)
    print("time: ", time)

    # Combine the date and time into a single string then convert it to correct format
    formatted_datetime = f"{date}T{time}"

    print("formatted_datetime: ", formatted_datetime)

    appointment = db.find_one('Appointments',
                              {'Appointment_date': formatted_datetime,
                               'nNumber': session['n_number']})

    print("appointment: ", appointment)

    # Check if the appointment exists
    if appointment is not None:
        # If the appointment exists, delete it
        print("Deleting appointment: ", appointment['_id'])
        appointment_collection.delete_one({'_id': appointment['_id']})
        return jsonify({'message': 'Appointment deleted successfully'}), 200
    else:
        print("Appointment not found")
        # If the appointment does not exist, return an error message
        return jsonify({'message': 'Appointment not found'}), 404


# Returns availability of all tutors and time for a specific subject on a specific date and specific time to front-end
# Format is: [{"tutor_name": "Brandon DeCelle", "tutor_times": ["09:00", "10:00", "11:00"]}, {"tutor_name": "Carlos Acacio", "tutor_times": ["13:00", "14:00", "15:00"]}
# ALSO, THIS MUST BE FIXED ACCORDING TO THE CHANGES IN THE NEXT ROUTE.
# NOT BEING USED RIGHT NOW
@app.route('/get_subject_availability_at_specific_time', methods=['GET'])
def get_subject_availability_at_specific_time():
    # Get the specific day and subject from the JSON request
    # JSON response should be in the form of {"subject": "CSIS 2101", "date": "mm dd yyyy", "time": "hh:mm"}
    data = request.json
    specific_subject = data['subject']
    specific_date = data['date']
    specific_time = data['time']

    # Convert the date string to a datetime object and get the day of the week
    date_object = datetime.strptime(specific_date, "%m-%d-%y")
    specific_day = date_object.strftime("%A")

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
                            existing_tutor_appointment = appointment_collection.find_one({
                                'Appointment_date': specific_date,
                                'Appointment_time': specific_time,
                                'tutor_name': tutor['first_name'] + ' ' + tutor['last_name']
                            })

                            # Check if an appointment for this time and current user already exists
                            existing_user_appointment = appointment_collection.find_one({
                                'Appointment_date': specific_date,
                                'Appointment_time': time_slot['start_time'],
                                'nNumber': session['n_number']
                            })

                            print(existing_tutor_appointment)
                            print(existing_user_appointment)

                            # If no existing appointment for the tutor and the user, add the start time to the tutor's times
                            if existing_tutor_appointment is None and existing_user_appointment is None:
                                tutor_times.append(time_slot['start_time'])

            # If the tutor has times on the specific day, add them to the tutor availability
            if tutor_times:
                tutor_availability.append({
                    'tutor_name': tutor['first_name'] + ' ' + tutor['last_name'],
                    'tutor_times': tutor_times
                })

    # Return the tutor availability as JSON response
    return jsonify(tutor_availability)


# This route is the same as get_subject_availability_at_specific_time but without the specific time
@app.route('/get_subject_availability', methods=['POST', 'GET'])
def get_subject_availability():
    # Get the specific day and subject from the JSON request
    # JSON response should be in the form of {"subject": "CSIS 2101", "day": "mm-dd-yyyy"}
    data = request.json
    specific_subject = data['subject']
    specific_date = data['day']

    # Print the data received from the front-end
    print(f"Received data: {data}")

    # Convert the date string to a datetime object and get the day of the week
    date_object = datetime.strptime(specific_date, "%m-%d-%y")
    specific_day = date_object.strftime("%A")

    # Print the specific day
    print(f"Specific day: {specific_day}")

    # Retrieve all the tutors
    tutors = db.find('Staff', {})

    # Initialize an empty list to store the tutor availability
    tutor_availability = []

    for tutor in tutors:
        # Print the tutor being checked
        print(f"Checking tutor: {tutor['first_name']} {tutor['last_name']}")

        # Check if the tutor teaches the specific subject
        if specific_subject in tutor['Courses']:
            # Initialize an empty list to store the times for this tutor
            tutor_times = []

            # For each day in the tutor's availability
            for day, times in tutor['Availability'].items():
                # Print the day being checked
                print(f"Checking day: {day}")

                # Check if the day matches the specific day
                if day == specific_day:
                    # For each time slot on this day
                    for time_slot in times['time_slots']:
                        # Print the time slot being checked
                        print(f"Checking time slot: {time_slot['start_time']}")

                        # Combine the specific day and the start time into a single string
                        datetime_string = f"{specific_date} {time_slot['start_time']}"

                        # Convert the string to a datetime object
                        datetime_object = datetime.strptime(datetime_string, "%m-%d-%y %H:%M")

                        # Convert the datetime object to a string in the format "YYYY-MM-DDTHH:MM"
                        formatted_datetime = datetime_object.strftime("%Y-%m-%dT%H:%M")

                        print(formatted_datetime)

                        existing_tutor_appointment = db.find_one('Appointments',
                                                                 {'Appointment_date': formatted_datetime,
                                                                  'Appointment_time': time_slot['start_time'],
                                                                  'Tutor': tutor['first_name'] + ' ' + tutor['last_name']})

                        existing_user_appointment = db.find_one('Appointments',
                                                               {'Appointment_date': formatted_datetime,
                                                                'Appointment_time': time_slot['start_time'],
                                                                'nNumber': session['n_number']})

                        # If no existing appointment for the tutor and the user, add the start time to the tutor's times
                        if existing_tutor_appointment is None and existing_user_appointment is None:
                            tutor_times.append(time_slot['start_time'])

                    # I can safely break this loop because only 1 day can match the specific day.
                    break

            # If the tutor has times on the specific day, add them to the tutor availability
            # I store the email too for the front-end to return to me when creating the appointment
            if tutor_times:
                tutor_availability.append({
                    'tutor_name': tutor['first_name'] + ' ' + tutor['last_name'],
                    'tutor_times': tutor_times,
                    'tutor_email': tutor['email']
                })

    # Print the tutor availability
    print(f"Tutor availability: {tutor_availability}")

    if len(tutor_availability) == 0:
        tutor_availability.append("None available")

    # Return the tutor availability as a JSON response
    return jsonify(tutor_availability)


# Route for generic error handling
@app.route('/error')
def error():
    error_message = request.args.get('message', 'An error occurred.')
    return render_template('error.html', error=error_message)


# Route to get tutor appointments
@app.route('/get_tutor_appointments', methods=['POST'])
def get_tutor_appointments():
    pass


# Route to get tutor appointment details
@app.route('/get_tutor_appointment_details', methods=['POST'])
def get_tutor_appointment_details():
    pass


# Route for staff login
@app.route('/staff_login', methods=['GET', 'POST'])
def staff_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        if login_successful_staff(email, password):
            return redirect(url_for('staff_home'))
        else:
            return redirect(url_for('staff_login'))

    return render_template('staff_login.html')


# Route to get to account settings home
@app.route('/account_home')
def account_home():
    return render_template('account_home.html')


# Function to check if the staff login is successful
def login_successful_staff(email, password):
    if not email or not password:
        return False

    staff = db.find_one('Staff', {'email': email})

    if staff is None:
        return False

    elif staff['email'] == email and password == 'test':
        session['email'] = email
        return True
    else:
        return False


# Route to render the staff home page
@app.route('/staff_home')
def staff_home():
    return render_template('staff_home.html')


# Logout route for staff
@app.route('/logout_staff')
def logout_staff():
    session.pop('email', None)
    return render_template('staff_login.html')


if __name__ == '__main__':
    app.run(debug=False)
