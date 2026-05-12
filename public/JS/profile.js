//==================================================
// DOM ELEMENTS
//==================================================
const createRelativeBtn = document.getElementById("createRelative");
const relativeTable = document.getElementById("relativeTable");
const relativeTableBody = document.getElementById("relativeTableBody");

const createMedicationBtn = document.getElementById("createMedication");
const medicationTable = document.getElementById("medicationTable");
const medicationTableBody = document.getElementById("medicationTableBody");

const addMedicationBtn = document.getElementById("addMedication");
const addGuardianBtn = document.getElementById("addGuardian");
const saveGuardianForRelativeBtn = document.getElementById("saveGurdianForRelative");

// INIT
window.onload = function () {
    loadUser();
    loadLogs();
    loadChildren();
    loadMedications();
    loadGuardians();
};

// GENERAL FETCH HELPERS
function getData(url) {
    return fetch(url).then(res => res.json());
}

function postData(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => res.text());
}

// USER
function loadUser() {
    getData("/getUser")
        .then(data => {
            document.getElementById("hello").innerText = `Hello ${data.firstname}.`;
        })
        .catch(err => console.log("USER ERROR:", err));
}

// RELATIVES / CHILDREN
createRelativeBtn.addEventListener("click", openRelativeRow);

function openRelativeRow() {
    if (relativeTable.style.display !== "none") return;

    relativeTable.style.display = "table";

    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" placeholder="Relative name"></td>
        <td><button onclick="saveChild(this)">Save</button></td>
        <td><button onclick="closeRelativeRow(this)">Close</button></td>
    `;

    relativeTableBody.appendChild(row);
}

window.saveChild = function (btn) {
    const row = btn.parentNode.parentNode;
    const name = row.children[0].children[0].value;

    if (!name) {
        alert("Relative name is required");
        return;
    }

    postData("/addChild", { name })
        .then(msg => {
            console.log(msg);
            alert(msg);

            closeRelativeRow(btn);
            loadChildren();
        })
        .catch(err => console.log("ADD CHILD ERROR:", err));
};

function loadChildren() {
    getData("/getChildren")
        .then(data => {

            console.log("CHILDREN DATA:", data);
            const childSelect1 = document.getElementById("childSelect1");
            const childSelect2 = document.getElementById("childSelect2");

            childSelect1.innerHTML = `<option value="" disabled selected hidden>Select Relative</option>`;
            childSelect2.innerHTML = `<option value="" disabled selected hidden>Select Relative</option>`;

            data.forEach(child => {
                const option1 = document.createElement("option");
                option1.value = child.id;
                option1.textContent = child.name;

                const option2 = document.createElement("option");
                option2.value = child.id;
                option2.textContent = child.name;

                childSelect1.appendChild(option1);
                childSelect2.appendChild(option2);
            });
        })
        .catch(err => console.log("LOAD CHILDREN ERROR:", err));
}

// LOGS TABLE
function loadLogs() {
    getData("/getLogs")
        .then(data => {
            const logsTableBody = document.getElementById("logsTableBody");

            logsTableBody.innerHTML = "";

            data.forEach(row => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${row.child_name}</td>
                    <td>${row.medication_name}</td>
                    <td>${row.dosage || ""}</td>
                    <td>${row.scheduled_time}</td>
                    <td>${row.guardian_name || ""}</td>
                `;

                logsTableBody.appendChild(tr);
            });
        })
        .catch(err => console.log("LOGS ERROR:", err));
}

// MEDICATIONS
createMedicationBtn.addEventListener("click", openMedicationRow);

function openMedicationRow() {
    if (medicationTable.style.display !== "none") return;

    medicationTable.style.display = "table";

    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" placeholder="Medication name"></td>
        <td>
            <select>
                <option value="1">Yes</option>
                <option value="0">No</option>
            </select>
        </td>
        <td><button onclick="saveMedication(this)">Save</button></td>
        <td><button onclick="closeMedicationRow(this)">Close</button></td>
    `;

    medicationTableBody.appendChild(row);
}

window.saveMedication = function(btn){

    const row = btn.parentNode.parentNode;

    const name = row.children[0].children[0].value;
    const antibiotic = row.children[0].children[0].value;

    if(!name){
        alert("Medication name is required");
        return;
    }

    postData("/addMedicationType",{
        name,
        antibiotic
    })
    .then(msg => {
        console.log("MEDICATION TYPE SERVER:", msg);
        alert(msg);

        closeMedicationRow(btn);
        loadMedications();
    })
    .catch(err => {
        console.log("SAVE MEDICATION ERROR:", err);
    });
};

function loadMedications() {
    getData("/getMedications")
        .then(data => {
            const medicationSelect = document.getElementById("medicationSelect");

            medicationSelect.innerHTML = `<option value="" disabled selected hidden>Select Medication</option>`;

            data.forEach(med => {
                const option = document.createElement("option");
                option.value = med.id;
                option.textContent = med.name;

                medicationSelect.appendChild(option);
            });
        })
        .catch(err => console.log("LOAD MEDICATIONS ERROR:", err));
}

addMedicationBtn.addEventListener("click", () => {
    const child_id = document.getElementById("childSelect1").value;
    const medication = document.getElementById("medicationSelect").value;
    const dosage = document.getElementById("dosage").value;
    const timeToSend = document.getElementById("timeToSend").value;

    if (!child_id || !medication || !dosage || !timeToSend) {
        alert("All fields are required");
        return;
    }

    postData("/addMedication", {
        child_id,
        medication,
        dosage,
        timeToSend
    })
        .then(msg => {
            console.log("SERVER:", msg);
            alert(msg);

            if (msg === "Medication added") {
                document.getElementById("childSelect1").selectedIndex = 0;
                document.getElementById("medicationSelect").selectedIndex = 0;
                document.getElementById("dosage").value = "";
                document.getElementById("timeToSend").value = "";

                loadLogs();
            }
        })
        .catch(err => console.log("ADD MEDICATION ERROR:", err));
});

// GUARDIANS
addGuardianBtn.addEventListener("click", () => {

    const name = document.getElementById("guardianName").value;
    const relationship = document.getElementById("guardianRelationship").value;
    const email = document.getElementById("guardianEmail").value;

    if (!name || !relationship || !email) {
        alert("All guardian fields are required");
        return;
    }

    postData("/addGuardian", {
        name,
        relationship,
        email
    })
        .then(msg => {
            console.log("GUARDIAN SERVER:", msg);
            alert(msg);

            if (msg.trim() === "Guardian added successfully") {
                document.getElementById("guardianName").value = "";
                document.getElementById("guardianRelationship").value = "";
                document.getElementById("guardianEmail").value = "";

                loadGuardians();
            }
        })
        .catch(err =>
            {console.log("GUARDIAN ERROR:", err)
        });
});

function loadGuardians() {
    getData("/getGuardian")
        .then(data => {
            const guardianSelect = document.getElementById("guardianChildSelect");

            guardianSelect.innerHTML = `<option value="" disabled selected hidden>Select Guardian</option>`;

            data.forEach(guardian => {
                const option = document.createElement("option");
                option.value = guardian.id;
                option.textContent = guardian.name;

                guardianSelect.appendChild(option);
            });
        })
        .catch(err => console.log("LOAD GUARDIANS ERROR:", err));
}

saveGuardianForRelativeBtn.addEventListener("click", () => {
    const child_id = document.getElementById("childSelect2").value;
    const guardian_id = document.getElementById("guardianChildSelect").value;

    if (!child_id || !guardian_id) {
        alert("Please select relative and guardian");
        return;
    }

    postData("/addChildGuardian", {
        child_id,
        guardian_id
    })
        .then(msg => {
            alert(msg);
            loadLogs();
        })
        .catch(err => console.log("CHILD GUARDIAN ERROR:", err));
});

// CLOSE BUTTONS
window.closeRelativeRow = function (btn) {
    const row = btn.parentNode.parentNode;
    row.remove();
    relativeTable.style.display = "none";
};

window.closeMedicationRow = function (btn) {
    const row = btn.parentNode.parentNode;
    row.remove();
    medicationTable.style.display = "none";
};