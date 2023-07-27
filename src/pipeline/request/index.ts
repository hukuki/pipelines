import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
axios.defaults.baseURL = 'https://bedesten.adalet.gov.tr/mevzuat/';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Requester {

    private static __singleton__: Requester = new Requester();

    private axios: AxiosInstance;
    private blocked: boolean = false;

    private constructor() {
        this.axios = axios.create(
            { headers: { "Content-Type": "application/json" } }
        );
    }

    static get instance() {
        return Requester.__singleton__;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<T> {
        if (this.blocked) {
            await sleep(2000);
        }

        while (true) {
            try {
                const response = await this.axios.post<T>(url, data, config);
                this.blocked = false;

                return response.data;
            }
            catch (error) {
                //console.log("Too many requests. Waiting.")

                this.blocked = true;
                
                await sleep(2000);
            }
        }
    }

    block(): void {
        this.blocked = true;
    }
}

export default Requester;