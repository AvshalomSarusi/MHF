const sqlQueryInput = document.getElementById('sqlQueryInput');
const runQueryBtn = document.getElementById('runQueryBtn');
const queryResult = document.getElementById('queryResult');

window.onload = function(){
    loadDashboardStats();
};

function runQuery() {

    const sqlQuery = sqlQueryInput.value.trim();

    if (!sqlQuery) {
        queryResult.textContent = 'יש לכתוב קודם שאילתת SQL.';
        return;
    }

    fetch('/admin/runQuery', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sqlQuery })
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(msg => {
                    throw new Error(msg);
                });
            }

            return res.json();
        })
        .then(data => {
            queryResult.textContent = JSON.stringify(data, null, 2);
        })
        .catch(err => {
            queryResult.textContent = err.message;
        });
};

function loadDashboardStats() {

    console.log("loadDashboardStats in adminPage is run");
    fetch('/admin/dashboardStats')
        .then(res => {
            if (!res.ok) {
                return res.text().then(msg => {
                    throw new Error(msg);
                });
            }

            return res.json();
        })
        .then(data => {
            document.getElementById('totalUsers').textContent = data.totalUsers;
            document.getElementById('totalChildren').textContent = data.totalChildren;
            document.getElementById('totalGuardians').textContent = data.totalGuardians;
            document.getElementById('totalMedications').textContent = data.totalMedications;
        })
        .catch(err => {
            console.log(err);
        });
};

runQueryBtn.addEventListener('click', runQuery);
