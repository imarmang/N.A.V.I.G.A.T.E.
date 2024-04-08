// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {

     // Select all elements with the class "custom-select"
    const customSelects = document.querySelectorAll(".custom-select");
    function populateCourses() {
        fetch('/courses', {method: 'GET'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to retrieve courses data');
                }
                return response.json();
            })
            .then(data => {
                const containerElement = document.querySelector('.options'); // Assuming this is the container for your divs
                containerElement.innerHTML = '';
                data.forEach(course => {
                    const div = document.createElement('div');
                    div.classList.add('option');
                    div.setAttribute('data-value', course.Subject + " " + course.Course_ID);
                    div.textContent = course.Subject + " " + course.Course_ID;
                    // Add event listener to each div
                    div.addEventListener("click", function () {
                        div.classList.toggle("active");
                        updateSelectedOptions(customSelects);
                    });
                    containerElement.appendChild(div);

                });
            })
            .catch(error => {
                console.error(error);
                // Display an error message to the user
                alert('Failed to load courses. Please try again later.');
            });
    }

    // Function to update selected options
    function updateSelectedOptions(customSelect){
        console.log('updateSelectedOptions function is called'); // Add this line

       // Get all active options that are not "all-tags"
        const selectedOptions = Array.from(customSelect.querySelectorAll(".option.active")).filter(option =>
        option !== customSelect.querySelector(".option.all-tags")).map(function(option){
            return {
                value: option.getAttribute("data-value"),
                text: option.textContent.trim()
            };
        });

         // Get the values of the selected options
        const selectedValues = selectedOptions.map(function
        (option){
            return option.value;
        });

        // Set the value of the hidden input to the selected values
        customSelect.querySelector(".tags_input").value = selectedValues.join(', ');

        let tagsHTML = "";

        // Check if any options are selected
        if (selectedOptions.length === 0) {
            // If no options are selected, show placeholder
            tagsHTML = '<span class="placeholder">Select the tags</span>';
        } else{
            // If options are selected, show up to 4 tags and the count of additional tags
            const maxTagsToShow = 4;
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

    // For each custom select, add event listeners and functionality
    customSelects.forEach(function(customSelect){
        const searchInput = customSelect.querySelector(".search-tags");
        const optionsContainer = customSelect.querySelector(".options");
        const noResultMessage = customSelect.querySelector(".no-result-message");
        const options = customSelect.querySelectorAll(".option");
        const allTagsOption = customSelect.querySelector(".option.all-tags");
        const clearButton = customSelect.querySelector(".clear");

        allTagsOption.addEventListener("click", function(){
            const isActive = allTagsOption.classList.contains("active");

            options.forEach(function(option){
                if(option !== allTagsOption){
                    option.classList.toggle("active", !isActive)
                }
            });

            updateSelectedOptions(customSelect);
        });
        clearButton.addEventListener("click", function(){
            searchInput.value = "";
            options.forEach(function(option){
                option.style.display = "block";
            });
            noResultMessage.style.display = "none";
        });

        searchInput.addEventListener("input", function(){
            const searchTerm = searchInput.value.toLowerCase();

            options.forEach(function(option) {
                const optionText = option.textContent.trim().trim().toLowerCase();
                const shouldShow = optionText.includes(searchTerm);
                option.style.display = shouldShow ? "block" : "none";
            });

            const anyOptionsMatch = Array.from(options).some(option => option.style.display === "block");
            noResultMessage.style.display = anyOptionsMatch ? "none": "block";

            if (searchTerm){
            optionsContainer.classList.add("option-search-active")
            }else{
                optionsContainer.classList.remove("option-search-active");
            }
        });
    });

    customSelects.forEach(function(customSelect){
        const options = customSelect.querySelectorAll(".option");
        options.forEach(function (option){
           option.addEventListener("click", function(){
               console.log('Option is clicked'); // Add this line
               option.classList.toggle("active");
               updateSelectedOptions(customSelect);
           });
        });
    });

    document.addEventListener("click", function(event){
       const removeTag = event.target.closest(".remove-tag");
       if (removeTag){
                  console.log('Remove tag is clicked'); // Add this line

           const customSelect = removeTag.closest(".custom-select");
           const valueToRemove = removeTag.getAttribute("data-value");
           const optionToRemove = customSelect.querySelector(".option[data-value='"+valueToRemove+"']");
           optionToRemove.classList.remove("active");

           const allTagsOption = customSelect.querySelector(".option.all-tags");
           const otherSelectedOptions = customSelect.querySelectorAll(".option.active:not(.all-tags)");

           if (otherSelectedOptions.length === 0){
               allTagsOption.classList.add("active");
           }
           updateSelectedOptions(customSelect);
       }
    });

    const selectBoxes = document.querySelectorAll(".select-box");
    let coursesPopulated = false;

    selectBoxes.forEach(function(selectBox ){
       selectBox.addEventListener("click", function(event){
           if(!event.target.closest(".tag")){
               const coursesContainer = document.getElementById("courses-container");
               if (coursesContainer.offsetParent !== null && !coursesPopulated){
                    populateCourses();
                    coursesPopulated = true;
               }

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

    function resetCustomSelects(){
        customSelects.forEach(function(customSelect) {
            customSelect.querySelectorAll(".option.active").forEach(function(option){
                option.classList.remove("active");
            });
            customSelect.querySelector(".option.all-tags").classList.remove("active");
            updateSelectedOptions(customSelect);
        });
    }
    updateSelectedOptions(customSelects[0]);

    const submitButton = document.querySelector(".btn_submit");
    submitButton.addEventListener("click", function(){
        let valid = true;

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
            let tags = document.querySelector(".tags_input").value;
            alert(tags);
            resetCustomSelects();
        }
    });
});



