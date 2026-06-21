const card = document.getElementById("card");
const nameInput = document.getElementById("name");
const search = document.getElementById("SearchBtn");

function logChildInfo(){

    const child_name = nameInput.value.trim();

    if(!child_name){
        card.innerHTML = "Please enter child name";
        return;
    }

    fetch(`/childeCard/${encodeURIComponent(child_name)}`)
        .then(res =>{
            if(!res.ok){
                return res.text().then(msg=>{
                    throw new Error(msg);
                });
            }
            return res.json();
        })

        .then(child=>{

            card.innerHTML = `
            <div class="child-card">
                <h3>${child.name}</h3>
                <p><strong>Weight:</strong> ${child.weight} kg</p>
                <p><strong>Height:</strong> ${child.height} cm</p>
            </div>`;

        })
        .catch(err =>{
            card.innerHTML=err.message;
        });
};

search.addEventListener('click',logChildInfo);