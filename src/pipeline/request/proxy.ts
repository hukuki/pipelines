import axios from "axios";

class ProxyPool {

    private origin: string;
    private provider: string;

    constructor({origin, provider}: {origin: string, provider: string}){
        this.origin = origin; 
        this.provider = provider;
    }

    async get(): Promise<string> {
        for (let i = 0; i < 20; i++) {
            try{
                const response = await axios.get(this.origin + "random",  { headers: { "accept": "application/json" } });
            
                const json = response.data;
                if(!Array.isArray(json)) throw Error("Invalid response from proxy pool");
    
                const proxy_string = json[0];
     
                if (proxy_string)
                    return proxy_string;
                
            }catch(e){
                console.log(e);
            }
            console.log("No proxy found, retrying in 10 seconds", i)
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        throw Error("No proxy found");
    }

    async delete(proxy: string) {
        const ip = proxy.split("@")[1].split(":")[0];
        await axios.delete(this.origin + "destroy?ip_address=" + ip, { headers: { "accept": "application/json" } });
    }

    async stop() {
        await axios.patch(`${origin}providers/${this.provider}?min_scaling=0&max_scaling=0`, { headers: { "accept": "application/json" } });
    }
}

export default ProxyPool;