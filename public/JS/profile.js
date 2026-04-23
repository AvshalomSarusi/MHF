const btn = document.getElementById("createRelative");
const table = document.getElementById("relativeTable");
const body = document.getElementById("relativeTableBody");

//הבאת נתונים מהדאטה בייס עבר המשתמש
fetch('/getUser')
.then(res => res.json())
.then(data => {
    document.getElementById("hello").innerText = "Hello " + data.firstname+".";
})
.catch(err => {
    console.log(err);
});

//כשלוחצים על הכפטור ליצירת ילד או בן משפחה אחר
btn.addEventListener("click",()=>{
    table.style.display = "table";

    const row = document.createElement("tr");

    row.innerHTML = `
    <td><input type ="text" placeholder = "Relative name"></td>
    <td><button onclick="saveChild(this)">Save</button>
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
    table.style.display="none";
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

    //הוספת תרופה 
    document.getElementById("addMedication").onclick = () => {

        const child_id = document.getElementById("childSelect").value;
        const medication = document.getElementById("medicationName").value;
        const dosage = document.getElementById("dosage").value;
    
        fetch('/addMedication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ child_id, medication, dosage })
        })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            location.reload();
        });
    };