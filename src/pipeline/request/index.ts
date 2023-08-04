import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import userAgent from "random-useragent";
import { RateLimiter } from "limiter";
import ProxyPool from './proxy';
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from "fs";

class Requester {

    private static __singleton__: Requester = new Requester({ verbose: false });

    private axios: AxiosInstance;
    private limiter: RateLimiter;
    private pool: ProxyPool | undefined;
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

    private constructor({ pool, verbose = false }: { pool?: ProxyPool, verbose?: boolean }) {
        this.axios = axios.create(
            {
                baseURL: 'https://bedesten.adalet.gov.tr/mevzuat/',
                headers: { "Content-Type": "application/json" }
            }
        );

        this.pool = pool;

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

        setInterval(() => {
            if (!(this.waitUntil.getTime() > new Date().getTime()) && this.monitoring.patience <= 0) {
                this.monitoring.patience = this.maxPatience;
                this.waitUntil = new Date();
                this.waitUntil.setMilliseconds(this.waitUntil.getMilliseconds() + 10000);
            }

            const sinceCheckpoint = new Date().getTime() - this.monitoring.checkpointTime.getTime();

            if (sinceCheckpoint > 5000) {
                this.monitoring.avgSuccessLastCheckpoint = this.monitoring.numSuccessSinceCheckpoint / 5;

                this.monitoring.checkpointTime = new Date();
                this.monitoring.numSuccessSinceCheckpoint = 0;
            }

            const avgSuccess = this.monitoring.numSuccess / (new Date().getTime() - this.monitoring.startTime.getTime()) * 1000;

            if (verbose) {
                console.clear();
                console.log("* time elapsed: " + (new Date().getTime() - this.monitoring.startTime.getTime()) / 1000 + " seconds");
                console.log("* successful requests per second (s)     : " + this.monitoring.avgSuccessLastCheckpoint);
                console.log("* successful requests per second (global): " + avgSuccess);
                console.log("* success rate: " + (this.monitoring.numSuccess / this.monitoring.numRequests));
                console.log("* patience: " + this.monitoring.patience);
            }

            if ((this.waitUntil.getTime() + 5000 < new Date().getTime()) && ((this.monitoring.avgSuccessLastCheckpoint < avgSuccess)))
                this.monitoring.patience--;
            else
                this.monitoring.patience = this.maxPatience;
        }, 100);
    }

    static get instance() {
        return Requester.__singleton__;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {

        if (this.waitUntil.getTime() > new Date().getTime())
            await new Promise((resolve) => setTimeout(resolve, this.waitUntil.getTime() - new Date().getTime() + Math.random() * 1000));

        // Throttling
        await this.limiter.removeTokens(1);

        this.monitoring.numRequests++;

        let httpsAgent: HttpsProxyAgent<string> | undefined;

        if (this.pool) {
            const proxy = await this.pool.get();
            httpsAgent = new HttpsProxyAgent(proxy);
        }

        let response;
        while (!response) {
            try {
                response = await this.axios.post<T>(url, data, {
                    ...config,
                    httpsAgent
                });
            } catch (e) {
                console.log("[Requester] An error occured ("+e.response?.statusText+") while fetching. Retrying...");
            }
        }

        this.monitoring.numSuccess++;
        this.monitoring.numSuccessSinceCheckpoint++;

        return response.data;
    }
}

export default Requester;