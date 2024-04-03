from flask import Flask, render_template, redirect, url_for, request, session, jsonify

from flask_bcrypt import generate_password_hash, check_password_hash

# This allows me to use my custom decorator with multiple functions and decorators
from functools import wraps

# Database access
import pymongo


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
    return redirect(url_for('student_login'))

# Flask Route to handle account creation
@app.route('/create_account', methods = ['POST'])
def create_account():
    # If structure to determine if POST was used
    if request.method == 'POST':

        # I request the email up here to check if it is already in use
        email = request.form['email']

        # Determine if email is already in use
        # TODO let user know it is already in use
        if email_already_used(email):
            return render_template('student_login.html')

        # Only add user if email is unique
        else:
            # Get information from the inputs in the HTML page
            firstName = request.form['firstName']
            lastName = request.form['lastName']
            password = request.form['password']
            nNumber = request.form['nNumber']

            # Encrypt password before sending it into the database
            pw_hash = generate_password_hash(password).decode('utf-8')

            # Input information into database by wrapping it in a dictionary
            inputDict = {'first_name': firstName, 'last_name': lastName, 'student_info': {'email': email, 'password': pw_hash, 'N#': nNumber}}

            students_collection.insert_one(inputDict)

            return render_template('student_login.html')


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

    # Checking if user is logged in
    if nNumber is None:
        # Redirect to login if user is not logged in
        return redirect(url_for('student_login'))

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
@check_logged_in
def calendar():
    appointment_collection = database["Appointments"]
    appointments = []

    # Only pull the columns I need from DB.
    for appointment in appointment_collection.find({'nNumber': session['n_number']},
                                                   {'_id': 0, 'Appointment_date': 1,
                                                    'Course': 1, 'Subject': 1}):

        appointments.append(appointment)

    # Returns the appointments list as JSON object
    return jsonify(appointments)


@app.route('/courses', methods=['GET'])
def get_courses():
    courses_collection = database["Courses"]

    # retrieves all courses
    courses = courses_collection.find({}, {'_id': 0, 'Course_ID': 1, 'Subject': 1})
    # creates list of courses formatted as dicts
    courses_list = [course for course in courses]
    print(courses_list)
    return jsonify(courses_list)


if __name__ == '__main__':
    app.run(debug=True)
