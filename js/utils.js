// utils.js
export const Utils = {
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },

    formatDateTime(date) {
        if (!(date instanceof Date)) date = new Date(date);
        return date.toLocaleString("pt-BR").replace(',', '.');
    },

    formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        });
    },

    updateClockAndTimer(element, startTime) {
        const now = new Date();

        if (element.classList.contains('relogio')) {
            const formattedDate = now.toLocaleDateString('pt-BR');
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            element.textContent = `${formattedDate} ${hours}:${minutes}:${seconds}`;
        }

        if (element.classList.contains('tempo-vaga') && startTime) {
            const diffMs = now - new Date(startTime);
            element.textContent = Utils.formatTime(diffMs);
        }
    },

    showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }, 10);
    },

    updateClock: (element) => {
        if (!element) return;

        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR');
        const formattedTime = now.toLocaleTimeString('pt-BR');
        element.textContent = `${formattedDate} ${formattedTime}`;
    },

    sanitizeInput(input) {
        return input.trim().replace(/[<>"'&]/g, "");
    },

    formatPhone(phone) {
        phone = phone.replace(/\D/g, "");
        if (phone.length > 11) phone = phone.slice(0, 11);
        if (phone.length <= 2) return `(${phone}`;
        if (phone.length <= 7)
            return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    },

    formatPlate(plate) {
        plate = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (plate.length > 7) plate = plate.slice(0, 7);
        if (plate.length <= 3) return plate;
        return `${plate.slice(0, 3)}-${plate.slice(3)}`;
    },

    validatePhone(phone) {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
    },

    validatePlate(plate) {
        return /^[A-Z]{3}\d[A-Z0-9]\d{2}$|^[A-Z]{3}\d{4}$/.test(
            plate.replace(/[^a-zA-Z0-9]/g, "")
        );
    }
};