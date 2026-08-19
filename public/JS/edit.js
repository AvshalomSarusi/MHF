
window.onload = function () {
    getLogs();
    loadMedicationsForDelete();
    loadGuardianForDelete();
    loadRelativeForDelete();
    loadRelativeForUpdate();
    loadRelativeForGuardianCancellation();
    loadGuardianForGuardianCancellation();
};
window.closeMenu = function (btn) {
    logsTableBody.style.display = "none";
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
                    <td>${row.guardian_name || "אין אפוטרופוס"}</td>
                    <td><button onclick="editLog(${row.id}, '${row.dosage}', '${row.scheduled_time}')">עריכה</button></td>
                    <td><button onclick="deleteLog(${row.id})">מחיקה</button></td>
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
        alert("מזהה רשומה לא תקין");
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

    const newDosage = prompt("הזינו מינון חדש:", currentDosage);

    if (newDosage === null) return;

    const newTime = prompt("הזינו שעה חדשה (HH:MM:SS):", currentTime);

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

function loadGuardianForDelete() {

    fetch('/getGuardian')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("guardianToDelete");

            select.innerHTML = `<option value ="" disabled selected hidden>בחר אפוטרופוס</option>`;

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
        alert("יש לבחור אפוטרופוס");
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

            select.innerHTML = `<option value = "" disabled selected hidden>בחר תרופה</option>`;

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
        alert("יש לבחור תרופה");
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

            select.innerHTML = `<option value="" disabled selected hidden>בחר בן משפחה</option>`;

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
        alert("יש לבחור בן משפחה");
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

function loadRelativeForUpdate(){

    fetch('/getChildren')
    .then(res=> res.json())
    .then(data=>{

        const select = document.getElementById("childToUpdate");

        select.innerHTML =`
        <option value="" disabled selected hidden>בחר בן משפחה</option>`;

        data.forEach(child =>{

            const option = document.createElement("option");

            option.value=child.id;
            option.textContent = child.name;

            select.appendChild(option);
        });
    })
    .catch(err=>{
        console.log(err);
    });
};

function updateRelativeData() {

    const childSelect = document.getElementById("childToUpdate");
    const weightInput = document.getElementById("childWeight");
    const heightInput = document.getElementById("childHeight");
    const msg = document.getElementById("updateChildMsg");

    const childId = childSelect.value;
    const weight = weightInput.value;
    const height = heightInput.value;

    if (!childId) {
        msg.textContent = "יש לבחור בן משפחה";
        return;
    }

    if (!weight || !height) {
        msg.textContent = "יש להזין משקל וגובה";
        return;
    }

    fetch(`/updateChildData/${childId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weight, height })
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(message => {
                    throw new Error(message);
                });
            }

            return res.text();
        })
        .then(data => {
            alert("נתוני בן המשפחה עודכנו בהצלחה");

            childSelect.value = "";
            weightInput.value = "";
            heightInput.value = "";

        })
        .catch(err => {
            msg.textContent = err.message;
        });
};

function loadRelativeForGuardianCancellation() {

    fetch('/getChildren')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("selectRToGuardianCancellation");

            select.innerHTML = `
            <option value="" disabled selected hidden>בחר בן משפחה</option>`;

            data.forEach(child => {

                const option = document.createElement("option");

                option.value = child.id;
                option.textContent = child.name;

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.log("Load relatives for cancellation error:", err);
        });
};

function loadGuardianForGuardianCancellation() {

    fetch('/getGuardian')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("selectGToGuardianCancellation");

            select.innerHTML = `
            <option value="" disabled selected hidden>בחר אפוטרופוס</option>`;

            data.forEach(guardian => {

                const option = document.createElement("option");

                option.value = guardian.id;
                option.textContent = guardian.name;

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.log("Load guardians for cancellation error:", err);
        });
};

function guardianCancellation() {

    const relativeSelect = document.getElementById('selectRToGuardianCancellation');
    const guardianSelect = document.getElementById('selectGToGuardianCancellation');
    const msg = document.getElementById('guardianCancellationMsg');

    const relativeId = relativeSelect.value;
    const guardianId = guardianSelect.value;

    msg.classList.remove("ok", "error");

    if (!relativeId) {
        msg.textContent = "יש לבחור בן משפחה";
        msg.classList.add("error");
        return;
    }

    if (!guardianId) {
        msg.textContent = "יש לבחור אפוטרופוס";
        msg.classList.add("error");
        return;
    }

    fetch(`/guardianCancellation/${relativeId}/${guardianId}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(message => {
                    throw new Error(message);
                });
            }

            return res.text();
        })
        .then(data => {

            msg.textContent = data;
            msg.classList.add("ok");

            relativeSelect.value = "";
            guardianSelect.value = "";
        })
        .catch(err => {
            msg.textContent = err.message;
            msg.classList.add("error");
        });
        getLogs();
};
