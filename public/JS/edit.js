
window.onload = function () {
    getLogs();
    loadMedicationsForDelete();
    loadGuardianForDelete();
    loadRelativeForDelete()
};

function getLogs() {

    fetch('/getLogs')
        .then(res => res.json())
        .then(data => {

            const table = document.getElementById("logsTableBody");

            table.innerHTML = "";

            data.forEach(row => {

                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${row.child_name}</td>
                    <td>${row.medication_name}</td>
                    <td>${row.dosage}</td>
                    <td>${row.scheduled_time}</td>
                    <td>${row.guardian_name || "No Guardian"}</td>
                    <td><button onclick="editLog(${row.id}, '${row.dosage}', '${row.scheduled_time}')">Edit</button></td>
                    <td><button onclick="deleteLog(${row.id})">Delete</button></td>
                `;

                table.appendChild(tr);

            });

        })
        .catch(err => {
            console.log("Error loading logs:", err);
        });
};

function deleteLog(id) {

    if (!id) {
        alert("Invalid record ID");
        return;
    }

    fetch(`/deleteLog/${id}`, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            getLogs();
        })
        .catch(err => {
            console.log("Delete error:", err);
        });
};

function editLog(id, currentDosage, currentTime) {

    const newDosage = prompt("Enter new dosage:", currentDosage);

    if (newDosage === null) return;

    const newTime = prompt("Enter new time (HH:MM:SS):", currentTime);

    if (newTime === null) return;

    fetch(`/updateLog/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            dosage: newDosage,
            scheduled_time: newTime
        })
    })
        .then(async res => {
            const msg = await res.text();

            if (!res.ok) {
                throw new Error(msg);
            }

            return msg;
        })
        .then(msg => {
            alert(msg);
            getLogs();
        })
        .catch(err => {
            alert(err.message);
            console.log("Update error:", err);
        });
};

window.closeMenu = function (btn) {
    logsTableBody.style.display = "none";
};

function loadGuardianForDelete() {

    fetch('/getGuardian')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("guardianToDelete");

            select.innerHTML = `<option value ="" disabled selected hidden>Select Guardian</option>`;

            data.forEach(guardian => {

                const option = document.createElement("option");

                option.value = guardian.id;
                option.textContent = guardian.name;

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.log("Load guardians error:", err);
        });
};

function deleteGuardian() {

    const guardianID = document.getElementById("guardianToDelete").value;

    if (!guardianID) {
        alert("Please select guardian");
        return;
    }

    fetch(`/deleteGuardian/${guardianID}`, {
        method: "DELETE"
    })

        .then(res => res.text())
        .then(msg => {

            alert(msg);

            loadGuardianForDelete();
            getLogs();
        })
        .catch(err => {
            console.log("Delete guardian error:", err);
        });
};

function loadMedicationsForDelete() {

    fetch('/getMedications')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("medicationToDelete");

            select.innerHTML = `<option value = "" disabled selected hidden>Select Madication</option>`;

            data.forEach(med => {
                const option = document.createElement("option");

                option.value = med.id;
                option.textContent = med.name;

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.log("Error loading medications:", err);
        });
};

function deleteMedication() {

    const medicationId = document.getElementById("medicationToDelete").value;

    if (!medicationId) {
        alert("Please select medication");
        return;
    }

    fetch(`/deleteMedication/${medicationId}`, {
        method: "DELETE"
    })

        .then(res => res.text())
        .then(msg => {

            alert(msg);
            loadMedicationsForDelete();
            getLogs();
        })
        .catch(err => {
            console.log("Delete medication error:", err);
        });
};

function loadRelativeForDelete() {

    fetch('/getChildren')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("relativeToDelete");

            select.innerHTML = `<option value="" disabled selected hidden>Select Relative</option>`;

            data.forEach(rel => {

                const option = document.createElement("option");

                option.value = rel.id;
                option.textContent = rel.name;

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.log("Error load relative: ", err);
        })
}

function deleteRelative() {

    const relativeId = document.getElementById("relativeToDelete").value;

    if (!relativeId) {
        alert("Please select relative");
        return;
    }

    fetch(`/deleteRelative/${relativeId}`, {
        method: "DELETE"
    })

        .then(res => res.text())
        .then(msg => {

            alert(msg)
            loadRelativeForDelete();
            getLogs();
        })
        .catch(err => {
            console.log("Delete relative err: ", err);
        });
};