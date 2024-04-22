// This is a check value to see if the courses have already been populated
let coursesPopulated = false;
// Options is a NodeList that will be keeping all the courses that were created dynamically in the populateCourses function
let options = null;
// Event listener for when the DOM is fully loaded
let courseCounter = 0;
document.addEventListener("DOMContentLoaded", function() {

     // Select all elements with the class "custom-select"
    const customSelects = document.querySelectorAll(".custom-select");

    // Function to update selected options
    function updateSelectedOptions(customSelect){
        const selectedOptions = Array.from(customSelect.querySelectorAll(".option.active")).map(function(option){
            return {
                value: option.getAttribute("data-value"),
                text: option.textContent.trim()
            };
        });
        if (!coursesPopulated){
            populateCourses(customSelect);
        }

        // Set the value of the hidden input to the selected values
        customSelect.querySelector(".tags_input").value = selectedOptions.join(', ');

        let tagsHTML = "";

        // Check if any options are selected
        if (selectedOptions.length === 0) {
            // If no options are selected, show placeholder
            tagsHTML = '<span class="placeholder">Select courses</span>';
        } else{
            // If options are selected, show up to 4 tags and the count of additional tags
            const maxTagsToShow = 3;
            let additionTagsCount = 0;

            selectedOptions.forEach(function(option, index){
                if(index < maxTagsToShow){
                    tagsHTML += '<span class="tag">'+option.text+
                    '<span class="remove-tag" data-value="'+
                    option.value+'">&times;</span></span>';
                }else{
                    additionTagsCount++;
                }
            });
            if (additionTagsCount > 0){
                tagsHTML += '<span class="tag">'+ additionTagsCount+'</span>';
            }
        }
        // Update the HTML of the selected options
        customSelect.querySelector(".selected-options").
        innerHTML = tagsHTML;
    }

    function populateCourses(customSelect) {
        fetch('/courses', {method: 'GET'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to retrieve courses data');
                }
                return response.json();
            })
            .then(data => {
                const containerElement = document.querySelector('.test-container'); // Assuming this is the container for your divs
                containerElement.innerHTML = '';
                data.forEach(course => {
                    const div = document.createElement('div');
                    div.classList.add('option');
                    div.setAttribute('data-value', course.Subject + " " + course.Course_ID);
                    div.textContent = course.Subject + " " + course.Course_ID;
                    // Add event listener to each div
                    div.addEventListener("click", function () {
                        if (courseCounter < 9) {
                            div.classList.toggle("active");
                            // For each custom select, call updateSelectedOptions
                            customSelects.forEach(function (customSelect) {
                                updateSelectedOptions(customSelect);
                            });
                            courseCounter++;
                            console.log("Number of courses Selected: " + courseCounter);
                        } else{
                            alert("You cannot select more than 9 courses.");
                        }
                    });
                    containerElement.appendChild(div);

                });
                coursesPopulated = true;  // Checking if the courses are populated

                // Select all elements with the class "option" within the customSelect element
                options = customSelect.querySelectorAll(".option");

            })
            .catch(error => {
                console.error(error);
                // Display an error message to the user
                alert('Failed to load courses. Please try again later.');
            });
    }

    // For each custom select, add event listeners and functionality
    customSelects.forEach(function(customSelect){
        const searchInput = customSelect.querySelector(".search-tags");
        const optionsContainer = customSelect.querySelector(".options");
        const noResultMessage = customSelect.querySelector(".no-result-message");
        // const options = customSelect.querySelectorAll(".option");
        const clearButton = customSelect.querySelector(".clear");

        clearButton.addEventListener("click", function(){
            searchInput.value = "";
            options.forEach(function(option){
                option.style.display = "block";
            });
            if (noResultMessage) {
                noResultMessage.style.display = "none";
            }
        });

        searchInput.addEventListener("input", function(){
            const searchTerm = searchInput.value.trim().toLowerCase();

            options.forEach(function(option) {
                const optionText = option.textContent.trim().toLowerCase();
                const shouldShow = optionText.includes(searchTerm);
                option.style.display = shouldShow ? "block" : "none";

            });

            const anyOptionsMatch = Array.from(options).some(option => option.style.display === "block");
            if (noResultMessage) {
                noResultMessage.style.display = anyOptionsMatch ? "none" : "block";
            }

            if (searchTerm){
                optionsContainer.classList.add("option-search-active")
            } else {
                optionsContainer.classList.remove("option-search-active");
            }
        });
    });

    customSelects.forEach(function(customSelect){
        const options = customSelect.querySelectorAll(".option");
        options.forEach(function (option){
           option.addEventListener("click", function(){
               option.classList.toggle("active");
               updateSelectedOptions(customSelect);
           });
        });
    });

    document.addEventListener("click", function(event){
       const removeTag = event.target.closest(".remove-tag");
       if (removeTag){
           const customSelect = removeTag.closest(".custom-select");
           const valueToRemove = removeTag.getAttribute("data-value");
           const optionToRemove = customSelect.querySelector(".option[data-value='"+valueToRemove+"']");
           optionToRemove.classList.remove("active");
           courseCounter--;
           console.log("Number of courses Selected: " + courseCounter);

           updateSelectedOptions(customSelect);
       }
    });

    const selectBoxes = document.querySelectorAll(".select-box");

    selectBoxes.forEach(function(selectBox ){
       selectBox.addEventListener("click", function(event){
           if(!event.target.closest(".tag")){
               selectBox.closest('.custom-select').classList.toggle("open");

           }
       });
    });

    document.addEventListener("click", function(event){
        if (!event.target.closest(".custom-select") && !event.target.closest(".remove-tag")) {
            customSelects.forEach(function(customSelect){
                customSelect.classList.remove("open");
            });
        }
    });


    window.resetCustomSelects = function() {
        customSelects.forEach(function(customSelect) {
            customSelect.querySelectorAll(".option.active").forEach(function(option){
                option.classList.remove("active");
            });

            updateSelectedOptions(customSelect);
            courseCounter = 0;
            console.log("Number of courses Selected: " + courseCounter);
        });
    }
    updateSelectedOptions(customSelects[0]);

    const submitButton = document.querySelector(".btn_submit");
    submitButton.addEventListener("click", function(){
        let valid = true;

        // Dictionary to return through JSON response
        let ret_dict = {"user_info": []};

        // Populating return dictionary with user info
        ret_dict["user_info"].push(document.querySelector("#firstName").value);
        ret_dict["user_info"].push(document.querySelector("#lastName").value);
        ret_dict["user_info"].push(document.querySelector("#nNumber").value);
        ret_dict["user_info"].push(document.querySelector("#email").value);
        ret_dict["user_info"].push(document.querySelector("#password").value);

        // let tags = document.querySelector(".tags_input").value;
        //
        // ret_dict["courses"] = tags.split(', ')
        // Collecting selected courses
        ret_dict["courses"] = Array.from(document.querySelectorAll(".option.active")).map(option => option.getAttribute("data-value"));

        customSelects.forEach(function(customSelect){
            const selectedOptions = customSelect.querySelectorAll(".option.active");
            if(selectedOptions.length === 0) {
                const tagErrorMsg = customSelect.querySelector(".tag-error-msg");
                tagErrorMsg.textContent = "This field is required";
                tagErrorMsg.style.display = "block";
                valid = false;
            }
            else{
                const tagErrorMsg = customSelect.querySelector(".tag-error-msg");
                tagErrorMsg.textContent = "";
                tagErrorMsg.style.display = "none";
            }

        });

        if (valid){
            sendSelectedOptionsToServer(ret_dict);
            resetCustomSelects();
        }
    });
});

// Sending a json of courses to create the account
function sendSelectedOptionsToServer(selectedOptions) {
    fetch('/create_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedOptions)
    })
        .then(response => {
            if (!response.ok) {
                alert('Email already in use');
                window.location.href = '/';
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.message === 'Account created successfully') {
                // Redirect to the logged in page
                window.location.href = '/';
            }

        })
    .catch(error => {
        console.error('Error:', error);
    });
}
