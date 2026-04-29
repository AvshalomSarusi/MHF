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
    }),


    emailAlreadyExists: "A user with this email is already registered",

    securityEmailAlreadyExists: (name) => ({
        subject: "Security Notice – MHF",
        text: `Hello ${name},

        Someone recently attempted to create an account using this email address.

        This may simply be a mistake. If this was not you, we recommend reviewing your account security and updating your password if necessary.

        MHF Security Team


        ------------------------


        שלום ${name},

        מישהו ניסה לאחרונה להירשם למערכת באמצעות כתובת האימייל שלך.

        ייתכן שמדובר בטעות, אך אם זו לא הייתה פעולה שלך, אנו ממליצים לבדוק את אבטחת החשבון שלך ולשקול שינוי סיסמה.

        צוות האבטחה,
        MHF`
    }),

};

module.exports = message;