// Classes base
class Vehicle {
    constructor(type, plate, phone) {
        this.type = type;
        this.plate = plate;
        this.phone = phone;
        this.entryTime = new Date();
    }
}

class ParkingSpace {
    constructor(number, type) {
        this.number = number;
        this.type = type;
        this.occupied = false;
        this.vehicle = null;
    }

    occupy(vehicle) {
        if (this.occupied) return false;

        this.occupied = true;
        this.vehicle = vehicle;
        return true;
    }

    free() {
        if (!this.occupied) return null;

        const receipt = this.generateReceipt();
        this.occupied = false;
        this.vehicle = null;
        return receipt;
    }

    generateReceipt() {
        if (!this.occupied) return null;

        const exitTime = new Date();
        const minutesParked = this.calculateMinutes(this.vehicle.entryTime, exitTime);
        const amountDue = this.calculateParkingFee(minutesParked);

        return {
            spaceNumber: this.number,
            vehicleType: this.type,
            plate: this.vehicle.plate,
            entryTime: this.vehicle.entryTime,
            exitTime: exitTime,
            minutesParked: minutesParked,
            amountDue: amountDue,
            phone: this.vehicle.phone
        };
    }

    calculateMinutes(entryTime, exitTime) {
        const diffMs = exitTime - entryTime;
        return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }

    calculateParkingFee(minutes) {
        const ratePerMinute = 0.166666;
        const fee = Math.round(minutes * ratePerMinute * 100) / 100;
        return !isNaN(fee) ? fee : 0;
    }

    toJSON() {
        return {
            number: this.number,
            type: this.type,
            occupied: this.occupied,
            vehicle: this.vehicle
        };
    }
}

// Sistema principal (Singleton)
let instance = null;

class ParkingSystem {
    constructor() {
        if (instance) return instance;

        this.carSpaces = Array(30).fill().map((_, i) => new ParkingSpace(i+1, "carro"));
        this.motoSpaces = Array(30).fill().map((_, i) => new ParkingSpace(i+1, "moto"));
        this.totalRevenue = 0;
        this.revenueHistory = [];

        this.loadFromLocalStorage();
        instance = this;
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem("parkingAGC24h");
        if (savedData) {
            try {
                const { version, carSpaces, motoSpaces, totalRevenue, revenueHistory } = JSON.parse(savedData);

                if (version === "1.1") {
                    this.carSpaces = carSpaces.map(space => {
                        const newSpace = new ParkingSpace(space.number, space.type);
                        newSpace.occupied = space.occupied;
                        if (space.vehicle) {
                            newSpace.vehicle = new Vehicle(
                                space.vehicle.type,
                                space.vehicle.plate,
                                space.vehicle.phone
                            );
                            newSpace.vehicle.entryTime = new Date(space.vehicle.entryTime);
                        }
                        return newSpace;
                    });

                    this.motoSpaces = motoSpaces.map(space => {
                        const newSpace = new ParkingSpace(space.number, space.type);
                        newSpace.occupied = space.occupied;
                        if (space.vehicle) {
                            newSpace.vehicle = new Vehicle(
                                space.vehicle.type,
                                space.vehicle.plate,
                                space.vehicle.phone
                            );
                            newSpace.vehicle.entryTime = new Date(space.vehicle.entryTime);
                        }
                        return newSpace;
                    });

                    this.totalRevenue = totalRevenue || 0;
                    this.revenueHistory = revenueHistory || [];
                }
            } catch (e) {
                console.error("Erro ao carregar dados:", e);
            }
        }
    }

    saveToLocalStorage() {
        const data = {
            version: "1.1",
            timestamp: new Date().toISOString(),
            carSpaces: this.carSpaces,
            motoSpaces: this.motoSpaces,
            totalRevenue: this.totalRevenue,
            revenueHistory: this.revenueHistory
        };
        localStorage.setItem("parkingAGC24h", JSON.stringify(data));
    }

    findFreeSpace(vehicleType) {
        const spaces = vehicleType === "carro" ? this.carSpaces : this.motoSpaces;
        const freeSpace = spaces.find(space => !space.occupied);
        return freeSpace ? { ...freeSpace } : null;
    }

    occupySpace(vehicleType, spaceNumber, plate, phone) {
        const spaces = vehicleType === "carro" ? this.carSpaces : this.motoSpaces;
        const spaceIndex = spaces.findIndex(space => space.number === spaceNumber);

        if (spaceIndex === -1 || spaces[spaceIndex].occupied) return false;

        const vehicle = new Vehicle(vehicleType, this.normalizarPlaca(plate), phone);
        const success = spaces[spaceIndex].occupy(vehicle);

        if (success) this.saveToLocalStorage();
        return success;
    }

    freeSpace(vehicleType, spaceNumber) {
        const spaces = vehicleType === "carro" ? this.carSpaces : this.motoSpaces;
        const spaceIndex = spaces.findIndex(space => space.number === spaceNumber);

        if (spaceIndex === -1 || !spaces[spaceIndex].occupied) return null;

        const receipt = spaces[spaceIndex].free();
        if (receipt) {
            this.totalRevenue += receipt.amountDue;
            this.revenueHistory.push({
                date: new Date(),
                amount: receipt.amountDue,
                type: 'parking_fee',
                plate: receipt.plate
            });
            this.saveToLocalStorage();
        }
        return receipt;
    }

    findVehicleByPlate(plate) {
        if (!plate) return null;

        const normalizedPlate = this.normalizarPlaca(plate);
        const allSpaces = [...this.carSpaces, ...this.motoSpaces];

        return allSpaces.find(
            space => space.occupied && space.vehicle.plate === normalizedPlate
        );
    }

    normalizarPlaca(plate) {
        return plate.replace(/[-\s]/g, "").toUpperCase();
    }

    getTipoPlaca(plate) {
        const normalized = this.normalizarPlaca(plate);

        if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(normalized)) {
            return "MERCOSUL";
        } else if (/^[A-Z]{3}\d{4}$/.test(normalized)) {
            return "ANTIGA";
        }
        return "INVALIDA";
    }

    formatarPlacaExibicao(plate) {
        const tipo = this.getTipoPlaca(plate);
        const normalized = this.normalizarPlaca(plate);

        if (tipo === "MERCOSUL") {
            return `${normalized.substring(0, 3)}-${normalized.substring(3, 4)}${normalized.substring(4, 5)}${normalized.substring(5)}`;
        } else if (tipo === "ANTIGA") {
            return `${normalized.substring(0, 3)}-${normalized.substring(3)}`;
        }
        return plate;
    }

    validarPlaca(plate) {
        const tipo = this.getTipoPlaca(plate);
        return tipo === "MERCOSUL" || tipo === "ANTIGA";
    }

    getOccupiedSpaces() {
        return {
            carros: this.carSpaces.filter(space => space.occupied).length,
            motos: this.motoSpaces.filter(space => space.occupied).length
        };
    }

    getFreeSpaces() {
        return {
            carros: this.carSpaces.filter(space => !space.occupied).length,
            motos: this.motoSpaces.filter(space => !space.occupied).length
        };
    }

    getDailyReport() {
        const today = new Date().toDateString();
        return this.revenueHistory
            .filter(entry => new Date(entry.date).toDateString() === today)
            .reduce((acc, entry) => acc + entry.amount, 0);
    }

    resetRevenue() {
        this.totalRevenue = 0;
        this.revenueHistory = [];
        this.saveToLocalStorage();
    }
}

// Exporta a instância do sistema de estacionamento
const parkingSystem = new ParkingSystem();
export default parkingSystem;