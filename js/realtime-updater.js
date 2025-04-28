class RealTimeUpdater {
    constructor() {
        this.updaters = new Map();
    }
    
    addUpdater(key, callback, interval) {
        this.removeUpdater(key);
        const id = setInterval(callback, interval);
        this.updaters.set(key, id);
        callback(); // Executar imediatamente
    }
    
    removeUpdater(key) {
        if (this.updaters.has(key)) {
            clearInterval(this.updaters.get(key));
            this.updaters.delete(key);
        }
    }
    
    clearAll() {
        this.updaters.forEach(id => clearInterval(id));
        this.updaters.clear();
    }
}

export const realTimeUpdater = new RealTimeUpdater();