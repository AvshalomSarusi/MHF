const btn = document.getElementById("createRelative");
const relativeTable = document.getElementById("relativeTable");
const medicationTable = document.getElementById("medicationTable");
const body = document.getElementById("relativeTableBody");

//הבאת נתונים מהדאטה בייס עבר המשתמש
fetch('/getUser')
    .then(res => res.json())
    .then(data => {
        document.getElementById("hello").innerText = "Hello " + data.firstname + ".";
    })
    .catch(err => {
        console.log(err);
    });
//--------------------------------------------------בן משפחה-----------------------------------------------------------------

//כשלוחצים על הכפטור ליצירת ילד או בן משפחה אחר
btn.addEventListener("click", () => {
    relativeTable.style.display = "table";

    const row = document.createElement("tr");

    row.innerHTML = `
    <td><input type ="text" placeholder = "Relative name"></td>
    <td><button onclick="saveChild(this)">Save</button></td>
    <td><button onclick="closeRelativeRow (this)">Close</button</td>
    `;
    body.appendChild(row);
});



function saveChild(btn) {//מכיל את האלמנט של הכפטור הספציפי (this).
    const row = btn.parentNode.parentNode;
    const name = row.children[0].children[0].value;

    fetch('/addChild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
        .then(res => res.text())
        .then(data => {
            console.log(data);
        });
    relativeTable.style.display = "none";
};

//טבלת בן משפחה ותרופות 
window.onload = function () {

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
                    <td>${row.dosage || ''}</td>
                    <td>${row.given_by}</td>
                    <td>${row.mail_sent_at || ''}</td>
                    <td>${row.given_at || 'Pending'}</td>
                `;

                table.appendChild(tr);
            });
        })
        .catch(err => console.log(err));
};

//בחירת בן משפחה 
fetch('/getChildren')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById("childSelect");

        data.forEach(child => {
            const option = document.createElement("option");
            option.value = child.id;
            option.textContent = child.name;
            select.appendChild(option);
        });
    });
//--------------------------------------------------תרופות-----------------------------------------------------------------

//הוספת תרופה 
const medBtn = document.getElementById("createMedication");
const medTable = document.getElementById("medicationTable");
const medBody = document.getElementById("medicationTableBody");

medBtn.addEventListener("click", () => {

    medTable.style.display = "table";

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
            <td><button onclick="closeMedicationRow(this)">Close</button</td>
        `;

    medBody.appendChild(row);
});

window.saveMedication = function (btn) {

    const row = btn.parentNode.parentNode;

    const name = row.children[0].children[0].value;
    const antibiotic = row.children[1].children[0].value;

    if (!name) {
        alert("Enter medication name");
        return;
    }

    fetch('/addMedicationType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, antibiotic })
    })
        .then(res => res.text())
        .then(msg => {
            console.log("SERVER:", msg);
            alert(msg);
            location.reload();
        })
        .catch(err => {
            console.log("ERROR:", err);
        });
};

//הצגת התרופות בבחירה
fetch('/getMedications')
    .then(res => res.json())
    .then(data => {

        const select = document.getElementById("medicationSelect");

        data.forEach(med => {
            const option = document.createElement("option");
            option.value = med.id;
            option.textContent = med.name;
            select.appendChild(option);
        });

    });
//--------------------------------------------------כפתורי סגירה-----------------------------------------------------------------

window.closeRelativeRow = function (btn) {
    const row = btn.parentNode.parentNode;
    row.remove();
    relativeTable.style.display = "none";
}

window.closeMedicationRow = function (btn) {
    const row = btn.parentNode.parentNode;
    row.remove();
    medicationTable.style.display = "none";
}