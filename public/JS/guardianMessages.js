window.onload = function(){
    loadGuardiansForMessage();
};

function loadGuardiansForMessage(){

    fetch('/getGuardian')
    .then(res=>res.json())
    .then(data=>{

        const select = document.getElementById("guardianSelect");

        select.innerHTML=`<option value="" disabled selected hidden>בחר אפוטרופוס</option>`;

        data.forEach(guardian => {
            
            const option = document.createElement("option");

            option.value=guardian.id;
            option.textContent=guardian.name;

            select.appendChild(option);
        });
    })
    .catch(err=>{
        console.log("Error loading guardians: ",err);
    });
};

function sendGuardianToMessage(){

    const guardianId=document.getElementById("guardianSelect").value;
    const subject = document.getElementById("messageSubject").value;
    const message = document.getElementById("messageBody").value;

    if(!guardianId || !subject || !message){
        alert("יש למלא את כל השדות");
        return;
    }

    const data = {
        guardianId: guardianId,
        subject: subject,
        message: message
    };

    fetch('/sendGuardianMessage',{
        method: "POST",
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res=>res.text())
    .then(result=>{
        alert(result);
    })
    .catch(err=>{
        console.log("Error sending message: ",err);
    });
    
}