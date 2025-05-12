/// <reference lib="webworker" />

import ExchangeRate from './models/exchange-rate.model';
import { environment } from '../environments/environment';


const promises: Promise<void>[] = [];

addEventListener('message', ({ data }) => {
  updateIndexDB(data);
});

// To get legacy support for promise.allsettled
function promiseAllSettled(promises: Promise<any>[]) {
  return Promise.all(promises.map(p => 
    p.then(value => ({ status: 'fulfilled', value }),
          reason => ({ status: 'rejected', reason }))
  ));
}

/**
 * Get all currency information from indexDB and update it with latest data
 * @param data - All currency stored in IndexDB
 */
async function updateIndexDB(data: ExchangeRate[]) {
    const LatestExchangeData: ExchangeRate[] = [];
    data.forEach((item: ExchangeRate) => {
      const promise = makeApiCalls(item).then((resp) => {
        const toStore = {base_currency: resp.base, results: resp.results};
        LatestExchangeData.push(toStore);
      });
      promises.push(promise);
     
    });

    const finished = await promiseAllSettled(promises);
    postMessage(LatestExchangeData);
}

/**
 * To make API request to get latest exchange data
 * @param item Currency exchange object
 * @returns Promise<any> - Resolves when data is fetched
 */
function makeApiCalls(item: ExchangeRate): Promise<any> {
  return new Promise(async (resolve) => {
    const baseUrl = environment.apiBaseUrl;
    const paramsObj = {
      from: item.base_currency,
      api_key: (environment.fastForexKey !== undefined)? environment.fastForexKey: ''
    }

      const params = new URLSearchParams(paramsObj);
      const url = `${baseUrl}/fetch-all?${params}`;
      const resp = await fetch(url);
      resolve(resp.json());
  })
}

