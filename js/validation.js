export const ValidationService = {
    validatePlate(plate) {
        const normalized = plate.replace(/[-\s]/g, "").toUpperCase();
        return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(normalized) || /^[A-Z]{3}\d{4}$/.test(normalized);
    },
    
    validatePhone(phone) {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
    },
    
    formatPlate(input) {
        let value = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
        
        if (value.length > 3) {
            if (/[A-Z]/.test(value[3])) {
                if (value.length > 4) {
                    value = value.substring(0, 4) + value.substring(4, 7);
                }
            } else {
                value = value.substring(0, 3) + value.substring(3, 7);
            }
        }
        
        if (value.length > 3) {
            if (/[A-Z]/.test(value[3])) {
                value = value.substring(0, 3) + "-" + value.substring(3);
            } else {
                value = value.substring(0, 3) + "-" + value.substring(3);
            }
        }
        
        return value.substring(0, 8);
    },
    
    formatPhone(input) {
        let value = input.replace(/\D/g, "");
        if (value.length > 0) {
            value = value.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, "($1) $2-$3");
        }
        return value;
    },
    
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};