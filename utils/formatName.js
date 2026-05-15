function formatName(name){
    if(!name){
        throw new Error("Name is required");
    }
    
    name = name.trim();

    return name.charAt(0).toUpperCase()+
    name.slice(1).toLowerCase();
}
module.exports=formatName;