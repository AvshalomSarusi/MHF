const message = {

    welcome: (name) => ({
        subject: "Welcome to MHF",
        text: `Hello ${name},
        
        Welcome to MHF.
        
        Your account has been created successfully.
        You can now log in and start using the system.
        
        We wish you a smooth and helpful experience.
        
        Thank you,
        MHF Team
        
        
        ------------------------
        
        ,${name} שלום
        
        .MHFברוכים הבאים ל־ 
        
        .החשבון שלך נוצר בהצלחה 
        .כעת ניתן להתחבר ולהתחיל להשתמש במערכת 
        
        .מאחלים לכם שימוש נוח ומועיל 
        
        ,תודה 
        MHF צוות `
    })
};

module.exports = message;