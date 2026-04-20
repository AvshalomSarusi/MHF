const btn = document.getElementById("createRelative");
const table = document.getElementById("relativeTable");
const body = document.getElementById("tableBody");

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

function saveChild(btn) {
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
}
//הבאת נתונים מהדאטה בייס עבר המשתמש
fetch('/getUser')
.then(res => res.json())
.then(data => {
    document.getElementById("hello").innerText = "Hello " + data.firstname+".";
})
.catch(err => {
    console.log(err);
});

