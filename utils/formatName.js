function formatName(name){
    if(!name){
        throw new Error("יש להזין שם");
    }
    
    name = name.trim();

    return name.charAt(0).toUpperCase()+
    name.slice(1).toLowerCase();
}
module.exports=formatName;