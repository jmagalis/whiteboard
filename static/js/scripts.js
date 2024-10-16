let currentDatabase = 'SMH'; // Default database
let isEditMode = {};
let ipAddrPort = '172.20.13.94:5021';
let url = "https://akita-healthy-suitably.ngrok-free.app";
let otherDatabase = 'RMH';
let isReadOnlyMode = false;

function devMode() {
    document.getElementById('devButton').style.display = "block";
}

function showPasscode() {
    document.getElementById('pw').style.display = "block";
    document.getElementById('pwButton').style.display = "block";
}

function protectpasscode() {
    const result = document.getElementById("pw").value;
    let passcode = 000;
    let space = '';
    if (result == space) {
      alert("Type passcode")
    } else {
      if (result == passcode) {
         devMode();
      } else {
         alert("Incorrect Passcode");
         location.reload();
      }
    }
}

function switchDatabase(db) {
    currentDatabase = db;
    document.getElementById('SMH-btn').classList.remove('active');
    document.getElementById('RMH-btn').classList.remove('active');
    document.getElementById(`${db}-btn`).classList.add('active');
    console.log(`Switched to ${currentDatabase} database.`);
    document.getElementById("add-job-form").style.display = "none";
    document.getElementById("search-job-form").style.display = "block"
    console.log(`Went past the forms.`);
    document.getElementById("Job#").value = "";
    document.getElementById("Loc.").value = "";
    document.getElementById("Tasks").value = "";
    console.log(`Went past the main values.`);
    document.getElementById("balancing-date").value = "";
    document.getElementById("commissioning-date").value = "";
    document.getElementById("installer-tasks").value = "";
    document.getElementById("technician-tasks").value = "";
    document.getElementById("designer-tasks").value = "";
    document.getElementById("lss-tasks").value = "";
    console.log(`Went past the sub values.`);
    document.getElementById("job-number-search").value = "";
    console.log(`Went past the search value.`);
    document.getElementById("search-parameter").value = "job";
    console.log(`Went past the search parameter.`);
    updatePlaceholder();
    console.log(`Went past the updatePlaceholder function.`);
    resetToggleEdit();
    console.log(`Went past the resetToggleEdit function.`);
    document.getElementById('results-container').innerHTML = '';
    console.log(`Destroyed the results container!`);
    document.getElementById("read-only-container").style.display = "flex";
}

function showAddForm() {
    document.getElementById("add-job-form").style.display = "block";
    document.getElementById("search-job-form").style.display = "none";
    document.getElementById("drag-container").style.display = "none";
    document.getElementById('results-container').innerHTML = '';
    document.getElementById("read-only-container").style.display = "none";
}

function addJob(event) {
    event.preventDefault();

    console.log("Add Job button clicked");

    let jobNumber = document.getElementById("Job#").value;
    let location = document.getElementById("Loc.").value;
    let task = document.getElementById("Tasks").value;
    let clientName = document.getElementById("Client").value;
    let balDate = document.getElementById("balancing-date").value;
    let comDate = document.getElementById("commissioning-date").value;
    let installTask = document.getElementById("installer-tasks").value;
    let techTask = document.getElementById("technician-tasks").value;
    let designTask = document.getElementById("designer-tasks").value;
    let lssTask = document.getElementById("lss-tasks").value;

    let jobData = {

    };

    console.log("Job#: ", jobNumber);
    console.log("Loc.: ", location);
    console.log("Tasks:", task);
    console.log("Last Modified: ", clientName);
    console.log("Balancing Date: ", balDate);
    console.log("Commissioning Date: ", comDate);
    console.log("Installer Tasks", installTask);
    console.log("Technician Tasks", techTask);
    console.log("Designer Tasks: ", designTask);
    console.log("LSS Tasks: ", lssTask);

    jobData = {
        'Job#': jobNumber,
        'Loc.': location,
        'Tasks': task,
        'Last Modified': clientName,
        'Database': currentDatabase,
        'Bal Date': balDate,
        'Com Date': comDate,
        'Install': installTask,
        'Tech': techTask,
        'Design': designTask,
        'Lead': lssTask
    };

    console.log("Job Data to send: ", jobData);

    fetch(`${url}/add_job_${currentDatabase}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || "Failed to add job");
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Job added successfully!");
        console.log("Job added: ", data);
        document.getElementById("add-job").reset();
        document.getElementById("add-job-form").style.display = "none";
        document.getElementById("job-number-search").value = "";
        document.getElementById("search-job-form").style.display = "block";
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
    });
}


function updateJob(event, index) {
    event.preventDefault();

    console.log(`Update Job button clicked for index ${index}`);

    let origJobNum = document.getElementById(`before_job_number_edit_${index}`).value || "";
    let jobNumber = document.getElementById(`after_job_number_edit_${index}`).value || "";
    let location = document.getElementById(`location_edit_${index}`).value || "";
    let task = document.getElementById(`task_edit_${index}`).value || "";
    let clientName = document.getElementById(`client_edit_${index}`).value || "";
    let balDate = document.getElementById(`balancing-date_edit_${index}`).value || "";
    let comDate = document.getElementById(`commissioning-date_edit_${index}`).value || "";
    let installTask = document.getElementById(`installer-tasks_edit_${index}`).value || "";
    let techTask = document.getElementById(`technician-tasks_edit_${index}`).value || "";
    let designTask = document.getElementById(`designer-tasks_edit_${index}`).value || "";
    let lssTask = document.getElementById(`lss-tasks_edit_${index}`).value || "";

    let jobData = {

    };

    console.log("Job Updated: ", origJobNum);
    console.log("Job#: ", jobNumber);
    console.log("Loc.: ", location);
    console.log("Tasks:", task);
    console.log("Last Modified: ", clientName);
    console.log("Balancing Date: ", balDate);
    console.log("Commissioning Date: ", comDate);
    console.log("Installer Tasks", installTask);
    console.log("Technician Tasks", techTask);
    console.log("Designer Tasks: ", designTask);
    console.log("LSS Tasks: ", lssTask);

    jobData = {
        'OldJob#': origJobNum,
        'Job#': jobNumber,
        'Loc.': location,
        'Tasks': task,
        'Last Modified': clientName,
        'Database': currentDatabase,
        'Bal Date': balDate,
        'Com Date': comDate,
        'Install': installTask,
        'Tech': techTask,
        'Design': designTask,
        'Lead': lssTask
    };

    console.log("Job Data to send: ", jobData);

    fetch(`${url}/update_job_${currentDatabase}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || "Failed to update job");
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Job updated successfully!\n\nPlease refresh to view changes.");
        console.log("Job updated: ", data);
        document.getElementById("job-number-search").value = "";

        resetToggleEditForIndex(index);
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
    });
}

function searchJob() {
    let searchValue = document.getElementById("job-number-search").value;
    let searchParameter = document.getElementById("search-parameter").value;
    resetToggleEdit();

    console.log("Search Job button clicked");

    if (!searchValue) {
        alert("Please enter a value to search.");
        return;
    }

    fetch(`${url}/search_${searchParameter}_${currentDatabase}/${searchValue}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    document.getElementById('results-container').innerHTML = '';
                    throw new Error(error.message || "No matching records found");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Retrieved Data: ", data);
            displayResults(data);
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
            document.getElementById("job-number-search").value = "";
        });
    
    return false;
}

function viewAll() {
    let searchParameter = document.getElementById("search-parameter").value;
    document.getElementById("drag-container").style.display = "none";
    resetToggleEdit();

    console.log("View All in Category button clicked");

    fetch(`${url}/viewAll_${searchParameter}_${currentDatabase}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || "No matching records found");
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Retrieved Data: ", data);
            displayResults(data);
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
    
    return false;
}

let jobResults = [];

function expandJobDetail(index) {
    const result = jobResults[index];
    const dialog = document.getElementById('jobDetailDialog');
    const content = document.getElementById('jobDetailContent');
    
    // Create the content of the dialog dynamically based on the result
    content.innerHTML = `
        <h3>Job Details</h3>
        <p><strong>Job Number:</strong> ${result['Job#']}</p>
        <p><strong>Location:</strong> ${result['Loc.']}</p>
        <p><strong>Tasks:</strong> ${result['Tasks']}</p>
    `;
    
    dialog.style.display = 'flex';
}

let reorderedJobs = [];

function showDragAndDrop() {
    const dragContainer = document.getElementById('drag-container');
    const jobCardsContainer = document.getElementById('drag-job-cards');
    document.getElementById("add-job-form").style.display = "none";
    document.getElementById('results-container').innerHTML = '';
    dragContainer.style.display = 'block';
    jobCardsContainer.innerHTML = ''; // Clear previous content

    // Fetch all jobs using the viewAll endpoint
    fetch(`${url}/viewAll_job_${currentDatabase}`)
        .then(response => response.json())
        .then(data => {
            reorderedJobs = data; // Store all jobs for reordering

            data.forEach((job, index) => {
                const box = document.createElement('div');
                box.classList.add('box');
                
                const item = document.createElement('div');
                item.classList.add('item');
                item.setAttribute('draggable', true);
                item.setAttribute('data-index', index);
                item.innerText = job['Job#'];

                box.appendChild(item);

                attachDragAndTouchListeners(item, box);  // Attach drag listeners to the card
                jobCardsContainer.appendChild(box);
            });
        })
        .catch(error => {
            console.error('Error fetching jobs:', error);
            alert('Failed to load jobs.');
            console.log(data);
        });
}

function attachDragAndTouchListeners(item, box) {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
    
    box.addEventListener('dragenter', dragEnter);
    box.addEventListener('dragover', dragOver);
    box.addEventListener('dragleave', dragLeave);
    box.addEventListener('drop', drop);
    
    item.addEventListener('touchstart', touchStart);
    item.addEventListener('touchmove', touchMove);
    item.addEventListener('touchend', touchEnd);
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragEnd(e) {
    e.target.classList.remove('hide');
}

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function dragLeave(e) {
    e.target.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const draggedIndex = e.dataTransfer.getData('text/plain');
    const draggedItem = document.querySelector(`[data-index='${draggedIndex}']`);

    const targetBox = e.target.closest('.box');

    if (!targetBox || draggedItem === targetBox.querySelector('.item')) {
        return;
    }

    // Get the parent boxes of the dragged and target items
    const draggedParentBox = draggedItem.parentElement;
    const targetParentBox = targetBox;

    // Get the list of all boxes
    const allBoxes = Array.from(document.querySelectorAll('.box'));
    const draggedBoxIndex = allBoxes.indexOf(draggedParentBox);
    const targetBoxIndex = allBoxes.indexOf(targetParentBox);

    // Insert the dragged item before or after the target based on their relative positions
    if (draggedBoxIndex < targetBoxIndex) {
        // If the dragged item is above the target, insert it after the target
        targetParentBox.parentElement.insertBefore(draggedParentBox, targetParentBox.nextSibling);
    } else {
        // If the dragged item is below the target, insert it before the target
        targetParentBox.parentElement.insertBefore(draggedParentBox, targetParentBox);
    }

    // Update reorderedJobs array to reflect the new order
    reorderedJobs.splice(targetBoxIndex, 0, reorderedJobs.splice(draggedBoxIndex, 1)[0]);
}

function touchStart(e) {
    const touch = e.touches[0];
    const item = e.target;

    // Simulate drag start by setting data and hiding the item
    e.dataTransfer = {
        setData: function(type, val) {
            this.data = val;
        },
        getData: function() {
            return this.data;
        }
    };
    e.dataTransfer.setData('text/plain', item.getAttribute('data-index'));

    item.classList.add('hide');
    item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
}

function touchMove(e) {
    e.preventDefault();  // Prevent scrolling

    const touch = e.touches[0];
    const item = e.target;

    // Move the item visually during touch
    item.style.position = 'absolute';
    item.style.left = `${touch.pageX - item.offsetWidth / 2}px`;
    item.style.top = `${touch.pageY - item.offsetHeight / 2}px`;
}

function touchEnd(e) {
    e.preventDefault();

    const item = e.target;
    item.classList.remove('hide');
    item.style.boxShadow = '';
    item.style.position = '';

    // Simulate the drop event
    const targetBox = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY).closest('.box');
    if (targetBox) {
        // Reuse the existing drop logic for touch events
        drop({
            target: targetBox,
            dataTransfer: {
                getData: () => item.getAttribute('data-index')
            },
            preventDefault: () => {},
        });
    }
}

function finishReorder() {
    fetch(`${url}/update_order_${currentDatabase}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderedJobs)  // Send the reordered jobs directly
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Jobs reordered successfully!');
            console.log('Updated order:', data);
            document.getElementById('drag-container').style.display = 'none';
            document.getElementById('add-job-form').style.display = 'none';
            document.getElementById('results-container').innerHTML = '';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating order:', error);
        alert('Failed to reorder jobs.');
    });
}

function closeJobDetailDialog() {
    const dialog = document.getElementById('jobDetailDialog');
    dialog.style.display = 'none';
}

function toggleReadOnlyMode() {
    isReadOnlyMode = !isReadOnlyMode;
    const button = document.getElementById('MRObutton');
	if(isReadOnlyMode == true) { button.innerText = "ON"; }
	if(isReadOnlyMode == false) { button.innerText = "OFF"; }
    document.getElementById("drag-container").style.display = "none";
    document.getElementById('results-container').innerHTML = '';
    console.log(`isReadOnlyMode is now: ${isReadOnlyMode}`);
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    
    jobResults = data;
    
    data.forEach((result, index) => {
        console.log(`Displaying result with index: ${index}`);
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-item');
        const lastModified = result['Last Modified'] || 'N/A';


        if (isReadOnlyMode == false) {
            resultDiv.innerHTML = `
                <div id="result-item-${index}">
                    <button type="button" class="showHide-button" onclick="toggleFormVisibility(${index})" id="toggle-visibility-btn-${index}" >
                        Hide Job
                    </button>
                    <div id="update-job-form-${index}" style="display:block;">
                        <form onsubmit="updateJob(event)" class="form-layout">
                            <table style="width:75%">
                                <tr>
                                    <th>Job Number:</th>
                                    <th style="width:15%">Location:</th>
                                    <th style="width:75%">Information:</th>
                                </tr>
                                <tr>
                                    <td>
                                        <input class="inputs" type="text" id="before_job_number_edit_${index}" name="Job#" value="${result['Job#'] || ''}" readonly>
                                        <input class="inputs" type="text" id="after_job_number_edit_${index}" name="Job#" value="${result['Job#'] || ''}" readonly style="display:none;">
                                    </td>
                                    <td>
                                        <input class="inputs" type="text" id="location_edit_${index}" name="Loc." value="${result['Loc.'] || ''}" readonly>
                                    </td>
                                    <td>
                                        <input class="inputs" style="text-align:left" type="text" id="task_edit_${index}" name="SMH" value="${result['Tasks'] || ''}" readonly>
                                    </td>
                                </tr>
                            </table>
                            <div class="subInfoDiv">
                                <button class="showSubInfo" type="button" onclick="showSubInfo(${index})" id="additional-info-${index}">+ Additional Information</button>
                                <button class="showSubInfo" type="button" style="float:right" onclick="expandJobDetail(${index})">+ Expand Info</button>
                            </div>
                            <div class="subInfoDiv" id="subInfoEdit_${index}" style="display:none;">
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="balancing-date_edit_${index}">Balancing Date:</label>
                                    <input type="text" class="dates" id="balancing-date_edit_${index}" name="balancing-date_edit" value="${result['Bal Date'] || ''}" readonly>
                                </div>
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="commissioning-date_edit_${index}">Commissioning Date:</label>
                                    <input type="text" class="dates" id="commissioning-date_edit_${index}" name="commissioning-date_edit" value="${result['Com Date'] || ''}" readonly>
                                </div>
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="installer-task_edit_${index}">Installer Tasks:</label>
                                    <input type="text" class="sub-tasks" id="installer-tasks_edit_${index}" name="installer-tasks_edit" value="${result['Install'] || ''}" readonly>
                                </div>
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="technician-tasks_edit_${index}">Technician Tasks:</label>
                                    <input type="text" class="sub-tasks" id="technician-tasks_edit_${index}" name="technician-tasks_edit" value="${result['Tech'] || ''}" readonly>
                                </div>
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="designer-tasks_edit_${index}">Designer Tasks:</label>
                                    <input type="text" class="sub-tasks" id="designer-tasks_edit_${index}" name="designer-tasks_edit" value="${result['Design'] || ''}" readonly>
                                </div>
                                <div class="extra-sec">
                                    <label class="dates-tasks-labels" for="lss-tasks_edit_${index}">LSS Tasks:</label>
                                    <input type="text" class="sub-tasks" id="lss-tasks_edit_${index}" name="lss-tasks_edit" value="${result['Lead'] || ''}" readonly>
                                </div>
                            </div>
                            <div style="align-self:center">
                                <label for="client_edit_${index}">Your Name:</label>
                                <input type="text" id="client_edit_${index}" name="Client" required>
                            </div>
                            <div style="align-self:center">
                                <button class="db-button" id="switch-db-${index}" type="button" style="display:none" onclick="switchJobDB(${index})">Switch Database</button>
                            </div>
                            <div style="align-self:center">
                                <button class="db-button" id="toggle-edit-${index}" type="button" onclick="toggleEdit(${index})">Edit Job</button>
                                <button class="db-button" type="button" onclick="deleteJob(${index})">Delete Job</button>
                            </div>
                        </form>
                    </div>
                    <div class="footer">
                        <p>Last Modified: ${lastModified}</p>
                    </div>
                </div>
            `;
        }
        else {
            resultDiv.innerHTML = `
                <div id="result-item-${index}">
                    <button type="button" class="showHide-button" onclick="toggleFormVisibility(${index})" id="toggle-visibility-btn-${index}" >
                        Hide Job
                    </button>
                    <div id="update-job-form-${index}" style="display:block;">
                        <form onsubmit="updateJob(event)" class="form-layout">
                            <div class="job-detail-box">
                                <h3>Job Details</h3>
                                <p><strong>Job Number:</strong> ${result['Job#']}</p>
                                <p><strong>Location:</strong> ${result['Loc.']}</p>
                                <p><strong>Tasks:</strong> ${result['Tasks']}</p>
                            </div>
                            <div class="subInfoDiv">
                                <button class="showSubInfo" type="button" onclick="showSubInfo(${index})" id="additional-info-${index}">+ Additional Information</button>
                            </div>
                            <div class="subInfoDiv" id="subInfoEdit_${index}" style="display:none;">
                                <p><strong>Balancing Date:</strong> ${result['Bal Date'] || 'N/A'}</p>
                                <p><strong>Commissioning Date:</strong> ${result['Com Date'] || 'N/A'}</p>
                                <p><strong>Installer Tasks:</strong> ${result['Install'] || 'N/A'}</p>
                                <p><strong>Technician Tasks:</strong> ${result['Tech'] || 'N/A'}</p>
                                <p><strong>Designer Tasks:</strong> ${result['Design'] || 'N/A'}</p>
                                <p><strong>LSS Tasks:</strong> ${result['Lead'] || 'N/A'}</p>
                            </div>
                        </form>
                    </div>
                    <div class="footer">
                        <p>Last Modified: ${lastModified}</p>
                    </div>
                </div>
            `;
        }

        resultsContainer.appendChild(resultDiv);
    });

    resultsContainer.style.display = 'block';
}

function hideForms() {
    document.getElementById("add-job-form").style.display = "none";
}

function deleteJob(index) {
    if (typeof index === 'undefined') {
        console.error('Index is not defined');
        return;
    }

    let jobNumber = document.getElementById(`before_job_number_edit_${index}`).value;
    let clientName = document.getElementById(`client_edit_${index}`).value;

    if (!clientName) {
        alert("Please enter your name before deleting the job.");
        return;
    }

    fetch(`${url}/delete_job_${currentDatabase}/${jobNumber}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Client: clientName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            console.log(`Job with index ${index} deleted successfully.`);
            document.getElementById("job-number-search").value = "";
            const resultItemContainer = document.getElementById(`update-job-form-${index}`).parentNode; 
            resultItemContainer.style.display = 'none';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert("Error deleting job");
    });
}

function toggleEdit(index) {
    const toggleButton = document.getElementById(`toggle-edit-${index}`);
    const inputs = document.querySelectorAll(`#update-job-form-${index} .inputs`);
    const dates = document.querySelectorAll(`#update-job-form-${index} .dates`);
    const subTasks = document.querySelectorAll(`#update-job-form-${index} .sub-tasks`);
    const nameInput = document.getElementById(`client_edit_${index}`);
    const switchDBButton = document.getElementById(`switch-db-${index}`);

    const beforeJobNumberInput = document.getElementById(`before_job_number_edit_${index}`);
    const afterJobNumberInput = document.getElementById(`after_job_number_edit_${index}`);

    if (isEditMode[index]) {
        if (!nameInput.value.trim()) {
            alert("Please enter your name.");
            return;
        }
        updateJob({ preventDefault: () => {} }, index);
    } else {
        inputs.forEach(function(input) {
            input.removeAttribute('readonly');
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '3px';
        });

        dates.forEach(function(input) {
            input.removeAttribute('readonly');
        });

        subTasks.forEach(function(input) {
            input.removeAttribute('readonly');
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '3px';
        });

        beforeJobNumberInput.style.display = 'none';
        afterJobNumberInput.style.display = 'block';

        nameInput.setAttribute('required', 'true');

        switchDBButton.style.display = 'block';

        toggleButton.innerText = "Update Job";
        isEditMode[index] = true;
    }
}

function resetToggleEdit() {
    console.log("Started resetToggleEdit");
    
    for (let index in isEditMode) {
        if (isEditMode[index]) {
            const inputs = document.querySelectorAll(`#update-job-form-${index} .inputs`);
            const dates = document.querySelectorAll(`#update-job-form-${index} .dates-edit-int`);
            const subTasks = document.querySelectorAll(`#update-job-form-${index} .sub-tasks-edit-int`);
            const toggleButton = document.getElementById(`toggle-edit-${index}`);
            const switchDBButton = document.getElementById(`switch-db-${index}`);

            const beforeJobNumberInput = document.getElementById(`before_job_number_edit_${index}`);
            const afterJobNumberInput = document.getElementById(`after_job_number_edit_${index}`);

            console.log("Defined Values");

            inputs.forEach(function(input) {
                input.setAttribute('readonly', true);
                input.style.border = 'none';
            });
            console.log("changed inputs");
            dates.forEach(function(input) {
                input.setAttribute('readonly', true);
                input.classList.replace('dates-edit-int', 'dates');
            });
            console.log("changed dates");
            subTasks.forEach(function(input) {
                input.setAttribute('readonly', true);
                input.classList.replace('sub-tasks-edit-int', 'sub-tasks');
            });
            console.log("changed subTasks");
            if (typeof index === 'undefined') {
                console.error('Index is not defined');
                console.error(`${index}`);
                return;
            }
            switchDBButton.style.display = 'none';
            beforeJobNumberInput.style.display = 'block';
            console.log("Showed before");
            afterJobNumberInput.style.display = 'none';
            console.log("Hiding after");
            toggleButton.innerText = "Edit Job";
            isEditMode[index] = false;
        }
    }
}

function resetToggleEditForIndex(index) {
    console.log(`Started resetToggleEdit for index ${index}`);
    const inputs = document.querySelectorAll(`#update-job-form-${index} .inputs`);
    const dates = document.querySelectorAll(`#update-job-form-${index} .dates-edit-int`);
    const subTasks = document.querySelectorAll(`#update-job-form-${index} .sub-tasks-edit-int`);
    const toggleButton = document.getElementById(`toggle-edit-${index}`);

    const beforeJobNumberInput = document.getElementById(`before_job_number_edit_${index}`);
    const afterJobNumberInput = document.getElementById(`after_job_number_edit_${index}`);

    inputs.forEach(function(input) {
        input.setAttribute('readonly', true);
        input.style.border = 'none';
    });

    dates.forEach(function(input) {
        input.setAttribute('readonly', true);
        input.classList.replace('dates-edit-int', 'dates');
    });

    subTasks.forEach(function(input) {
        input.setAttribute('readonly', true);
        input.classList.replace('sub-tasks-edit-int', 'sub-tasks');
    });

    beforeJobNumberInput.style.display = 'block';
    afterJobNumberInput.style.display = 'none';
    toggleButton.innerText = "Edit Job";
    isEditMode[index] = false;
}

function switchJobDB(index) {
    console.log(`Switch Job DB triggered for index ${index}`);
    
    event.preventDefault();

    let jobNumber = document.getElementById(`before_job_number_edit_${index}`).value || "";
    let location = document.getElementById(`location_edit_${index}`).value || "";
    let task = document.getElementById(`task_edit_${index}`).value || "";
    let clientName = document.getElementById(`client_edit_${index}`).value || "";
    let balDate = document.getElementById(`balancing-date_edit_${index}`).value || "";
    let comDate = document.getElementById(`commissioning-date_edit_${index}`).value || "";
    let installTask = document.getElementById(`installer-tasks_edit_${index}`).value || "";
    let techTask = document.getElementById(`technician-tasks_edit_${index}`).value || "";
    let designTask = document.getElementById(`designer-tasks_edit_${index}`).value || "";
    let lssTask = document.getElementById(`lss-tasks_edit_${index}`).value || "";

    if (!clientName) {
        alert("Please enter your name before switching databases.");
        return;
    }

    let otherDatabase = (currentDatabase === 'SMH') ? 'RMH' : 'SMH';

    console.log(`Current Database: ${currentDatabase}, Other Database: ${otherDatabase}`);

    let jobData = {
        'Job#': jobNumber,
        'Loc.': location,
        'Tasks': task,
        'Last Modified': clientName,
        'Database': currentDatabase,
        'Bal Date': balDate,
        'Com Date': comDate,
        'Install': installTask,
        'Tech': techTask,
        'Design': designTask,
        'Lead': lssTask
    };

    console.log("Job Data to send: ", jobData);

    fetch(`${url}/add_job_${otherDatabase}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || "Failed to add job to the other database");
            });
        }
        return response.json();
    })
    .then(data => { 
        console.log("Job added to other database: ", data);
        alert("Job successfully switched to the other database!");

        return fetch(`${url}/delete_job_${currentDatabase}/${jobNumber}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Client: clientName })
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            console.log("Job deleted from current database");

            document.getElementById("job-number-search").value = "";
            const resultItemContainer = document.getElementById(`update-job-form-${index}`).parentNode; 
            resultItemContainer.style.display = 'none';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error("Error occurred: ", error);
        alert(`Error: ${error.message}`);
    });
}

function showSubInfo(index) {
    const subInfoDiv = document.getElementById(`subInfoEdit_${index}`);
    
    if (subInfoDiv.style.display === "none" || subInfoDiv.style.display === "") {
        subInfoDiv.style.display = "block";
    } else {
        subInfoDiv.style.display = "none";
    }
    document.getElementById(`additional-info-${index}`).blur();
}

function updatePlaceholder() {
    const searchParam = document.getElementById('search-parameter').value;
    const searchInput = document.getElementById('job-number-search');

    if (searchParam === 'job') {
        searchInput.placeholder = 'Job Number...';
    } else if (searchParam === 'location') {
        searchInput.placeholder = 'Location...';
    } else if (searchParam === 'tasks') {
        searchInput.placeholder = 'Task...';
    } else if (searchParam === 'bal-date') {
        searchInput.placeholder = 'Balancing Date (M/D)...';
    } else if (searchParam === 'com-date') {
        searchInput.placeholder = 'Commissioning Date (M/D)...';
    } else if (searchParam === 'ins-task') {
        searchInput.placeholder = 'Installer Tasks...';
    } else if (searchParam === 'tec-task') {
        searchInput.placeholder = 'Technician Tasks...';
    } else if (searchParam === 'des-task') {
        searchInput.placeholder = 'Designer Tasks...';
    } else if (searchParam === 'lss-task') {
        searchInput.placeholder = 'LSS Tasks...';
    }
}

function toggleFormVisibility(index) {
    const form = document.getElementById(`update-job-form-${index}`);
    const toggleButton = document.getElementById(`toggle-visibility-btn-${index}`);

    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
        toggleButton.innerText = "Hide Job";
    } else {
        form.style.display = "none";
        toggleButton.innerText = "Show Job";
    }
}

function reportError() {
    const dialog = document.getElementById('errorReportDialog');
    dialog.style.display = 'block';
}

function sendEmail() {
    if (isMobileDevice()) {
        window.location.href = "ms-outlook://compose?to=issac.magallanes@jci.com&subject=Error Report for Release 1.2.1 BETA&body=Please describe the issue you found:";
    } else {
        window.location.href = "mailto:issac.magallanes@jci.com?subject=Error Report for Release 1.2.1 BETA&body=Please describe the issue you found:";
    }
    closeDialog();
}

function sendText() {
    if (isMobileDevice()) {
        window.location.href = "sms:+15079102595?body=Error Report for Release 1.2.1 BETA - Please describe the issue you found:";
    } else {
        alert("SMS option is only available on mobile devices.");
    }
    closeDialog();
}

function closeDialog() {
    const dialog = document.getElementById('errorReportDialog');
    dialog.style.display = 'none';
}

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

window.onload = hideForms;
