import pymongo
from pymongo.errors import ConnectionFailure, PyMongoError
from flask import redirect, url_for, session

# Database class to handle DB connection and errors

class Database:
    def __init__(self, uri, database_name):

        # Set connections 2 none to set up DB connection check
        self.client = None
        self.db = None

        # Retry connection 3 times. This will help to handle any connection errors and break out of loop upon
        # successful connection.
        for attempt in range(3):
            try:
                self.client = pymongo.MongoClient(uri)

                # The ismaster is used to check if DB connection was successful
                self.client.admin.command('ismaster')

                # If connection is successful, assign the database to the db variable
                self.db = self.client[database_name]

                # If connection is successful, break out of the loop
                break

            except ConnectionFailure:
                # If connection fails, continue to the next iteration of the loop
                continue

        # If connection still fails after 3 attempts
        if self.client is None or self.db is None:
            # Clear the session and redirect to the error page
            session.clear()
            error_message = "Could not connect to the database. Please try again later."
            redirect(url_for('error', message=error_message))


    def get_collection(self, collection_name):
        return self.db[collection_name]


    def find_one(self, collection_name, query):
        collection = self.get_collection(collection_name)

        # Try to find one document in the collection
        # If an error occurs, redirect to the error page
        try:
            return collection.find_one(query)
        except PyMongoError as exception:
            return redirect(url_for('error', message=str(exception)))


    # I use *args and **kwargs to pass any number of arguments to the find method, similar to how it works
    # in the PyMongo library
    def find(self, collection_name, *args, **kwargs):
        collection = self.get_collection(collection_name)

        # Try to find all documents in the collection according to specific criteria
        # If an error occurs, redirect to the error page
        try:
            return collection.find(*args, **kwargs)
        except PyMongoError as exception:
            return redirect(url_for('error', message=str(exception)))


    def insert_one(self, collection_name, document):
        collection = self.get_collection(collection_name)

        # Try to insert one document in the collection
        # If an error occurs, redirect to the error page
        try:
            return collection.insert_one(document)
        except PyMongoError as exception:
            return redirect(url_for('error', message=str(exception)))


    def update_one(self, collection_name, query, new_values):
        collection = self.get_collection(collection_name)

        # Try to update one document in the collection
        # If an error occurs, redirect to the error page
        try:
            return collection.update_one(query, new_values)
        except PyMongoError as exception:
            return redirect(url_for('error', message=str(exception)))


    def delete_one(self, collection_name, query):
        collection = self.get_collection(collection_name)

        # Try to delete one document in the collection
        # If an error occurs, redirect to the error page
        try:
            return collection.delete_one(query)
        except PyMongoError as exception:
            return redirect(url_for('error', message=str(exception)))