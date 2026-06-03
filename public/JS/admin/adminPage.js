const sqlQueryInput = document.getElementById('sqlQueryInput');
const runQueryBtn = document.getElementById('runQueryBtn');
const queryResult = document.getElementById('queryResult');

const runQuery = () => {

    const sqlQuery = sqlQueryInput.value.trim();

    if (!sqlQuery) {
        queryResult.textContent = 'Please write SQL query first.';
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

runQueryBtn.addEventListener('click', runQuery);