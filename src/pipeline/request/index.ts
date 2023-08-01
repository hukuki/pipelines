import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import userAgent from "random-useragent";
import { RateLimiter } from "limiter";
import ProxyPool from "./proxy";
import { HttpsProxyAgent } from "https-proxy-agent";
import  fs from "fs";

class Requester {

    private static __singleton__: Requester = new Requester();

    private axios: AxiosInstance;
    private limiter: RateLimiter;
    private pool: ProxyPool;
    private waitUntil: Date;
    private maxPatience = 200;

    private monitoring: {
        numRequests: number,
        numSuccess: number,
        startTime: Date,
        checkpointTime: Date,
        numSuccessSinceCheckpoint: number,
        avgSuccessLastCheckpoint: number,
        patience: number
    };

    private constructor() {
        this.axios = axios.create(
            {
                baseURL: 'https://bedesten.adalet.gov.tr/mevzuat/',
                headers: { "Content-Type": "application/json" }
            }
        );

        this.pool = new ProxyPool({
            origin: "http://localhost:8000/",
            provider: "aws",
        });

        this.monitoring = {
            startTime: new Date(),
            numRequests: 0,
            numSuccess: 0,

            checkpointTime: new Date(),
            numSuccessSinceCheckpoint: 0,
            avgSuccessLastCheckpoint: 0,

            patience: this.maxPatience,
        }

        this.limiter = new RateLimiter({
            tokensPerInterval: 7,
            interval: 1000,
        });

        this.waitUntil = new Date();

        setInterval(()=>{
                if(!(this.waitUntil.getTime() > new Date().getTime()) && this.monitoring.patience <= 0){
                    this.monitoring.patience = this.maxPatience;
                    this.waitUntil = new Date();
                    this.waitUntil.setMilliseconds(this.waitUntil.getMilliseconds() + 10000);
                    
                    //await this.pool.delete(proxy);
                    
                    //proxy = await this.pool.get();
                }    
            
                const sinceCheckpoint = new Date().getTime() - this.monitoring.checkpointTime.getTime();
                
                if(sinceCheckpoint > 5000){
                    this.monitoring.avgSuccessLastCheckpoint = this.monitoring.numSuccessSinceCheckpoint / 5;

                    this.monitoring.checkpointTime = new Date();
                    this.monitoring.numSuccessSinceCheckpoint = 0;
                }
                
                const avgSuccess = this.monitoring.numSuccess / (new Date().getTime() - this.monitoring.startTime.getTime())*1000;
               
                /*
                console.clear();
                console.log("* time elapsed: " + (new Date().getTime() - this.monitoring.startTime.getTime()) / 1000 + " seconds");
                console.log("* successful requests per second (s)     : " + this.monitoring.avgSuccessLastCheckpoint);
                console.log("* successful requests per second (global): " + avgSuccess);
                console.log("* success rate: " + (this.monitoring.numSuccess / this.monitoring.numRequests));
                console.log("* patience: " + this.monitoring.patience);
                */

                if((this.waitUntil.getTime() + 5000 < new Date().getTime()) && ((this.monitoring.avgSuccessLastCheckpoint < avgSuccess)))
                    this.monitoring.patience--;
                else
                    this.monitoring.patience = this.maxPatience;

                
        }, 100);
    }

    static get instance() {
        return Requester.__singleton__;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
        let proxy;

        while (true) {
            try {
                if(this.waitUntil.getTime() > new Date().getTime())
                    await new Promise((resolve) => setTimeout(resolve, this.waitUntil.getTime() - new Date().getTime() + Math.random()*1000));

                // Throttling
                await this.limiter.removeTokens(1);

                this.monitoring.numRequests++;
                
                //proxy = await this.pool.get();
                //const proxyAgent = new HttpsProxyAgent(proxy);

                const response = await this.axios.post<T>(url, data, {
                    ...config,
                    headers: {
                        ...config?.headers,
                        "User-Agent": userAgent.getRandom(),
                    },
                    //httpsAgent: proxyAgent
                });

                this.monitoring.numSuccess++;
                this.monitoring.numSuccessSinceCheckpoint++;

                return response.data;
            }
            catch (error) {
                //fs.appendFileSync("out", JSON.stringify(error));
                //proxy = await this.pool.get();
            }
        }
    }
} 

export default Requester;