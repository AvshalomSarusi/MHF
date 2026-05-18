
window.onload = function(){
    getLogs();
}

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
}

window.closeMenu = function(btn){
    logsTableBody.style.display = "none";
}