fetch('/getUser')
.then(res => res.json())
.then(data => {
    document.getElementById("hello").innerText = "Hello " + data.firstname+".";
})
.catch(err => {
    console.log(err);
});