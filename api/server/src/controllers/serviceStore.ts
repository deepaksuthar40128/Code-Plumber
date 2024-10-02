import { Service } from "./rpc";

export class Store{
    size:number; //number of services
    services:{[key:string]:Service[]};
    socketServices:{[key:string]:Service};
    maxServices:{[key in Service['type']]:number};
    constructor(startupServices:Service['type'][],maxService:{[key in Service['type']]:number},time:number=60000){
        this.size = startupServices.length;
        this.services = {};
        startupServices.forEach(s=>this.services[s]=[]);
        this.socketServices = {};
        this.#monitorHealth(time)
        this.maxServices = maxService;
    }
    addService(service:Service) {
        if(this.maxServices[service.type]>0){
            this.services[service.type].push(service);
        }
        else{
            service.Socket.destroy();
        }
        this.maxServices[service.type]--;
    }
    getService(type:string):Service|false{
        if(this.services[type].length==0)return false;
        let service = this.services[type][0]; 
        this.services[type].splice(0,1);
        this.services[type].push(service);
        return service;
    }
    removeClosedServices(){ 
        for(let key in this.services){
            if(this.services[key].length){
                let ind = this.services[key].findIndex(s=>{
                    return s.Socket.closed;
                })  
                if(ind!=-1){
                    this.maxServices[key as Service['type']]++;
                    this.services[key].splice(ind,1);  
                }
            }
        }
    }
    serviceList(){
        let list:string[] = []; 
        for(let key in this.services){
            this.services[key].forEach(s=>list.push(s.type));
        }
        return list;
    }

    addSocketService(socketId:string,service:Service){
        this.socketServices[socketId] = service;
    }

    getPreAllocatedService(socketId:string){
        if(socketId in this.socketServices)return this.socketServices[socketId];
        return false;
    }

    unallocateService(socketId:string){
        delete this.socketServices[socketId];
    }

    activeSocketServices(){
        return this.socketServices;
    }
    
    #monitorHealth(time:number){
        setInterval(() => {
            for(let key in this.services){
                this.services[key].forEach(s=>{
                    s.Socket.write(JSON.stringify({
                        type:'ping'
                    }))
                });
            }
        }, time);
    }
}