window.onload = function () {
    loadMedicationHistory();
};

function loadMedicationHistory() {

    fetch('/getMedicationHistory')
        .then(res => res.json())
        .then(data => {

            const table = document.getElementById("historyTableBody");

            table.innerHTML = "";

            data.forEach(row => {

                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${row.child_name}</td>
                    <td>${row.medication_name}</td>
                    <td>${row.amount}</td>
                    <td>${row.given_by || "-"}</td>
                    <td>${new Date(row.given_date).toLocaleDateString('he-IL')}</td>
                    <td>${row.given_time}</td>`;

                table.appendChild(tr);
            });
        })
        .catch(err => {
            console.log("MEDICATION HISTORY ERROR:", err);
        });
}