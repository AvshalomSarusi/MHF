// function Nickname(){
//     let name = document.getElementById("nickname").value;
//     let pass = document.getElementById("pass").value;

//     if(name=="Avshalom" && pass==123 || name=="Bar" && pass==123)
//     {
//         alert("isWork");
//     }else{ alert("Invalid username or password.") }
// };

var EnterAfterPass = document.getElementById("pass"); // שים לב שהinput הוא ה-nickname
EnterAfterPass.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // מונע את הפעולה ברירת המחדל של Enter (כמו שליחה של טופס)
        Nickname(); // מפעיל את הפונקציה
    }
});
//cron 
