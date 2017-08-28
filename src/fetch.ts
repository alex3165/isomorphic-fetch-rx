import * as isomorphicFetch from 'isomorphic-fetch';
import * as QueryString from 'qs';
import { Observable } from 'rxjs';

export interface Args {
  params?: Object;
  token?: {
    key: string;
    value: string;
  };
};

export interface ReqArgs extends Args {
  method: string;
};

const merge = (...args: any[]) => Object.assign({}, ...args);

const defaultArgs = {
  method: 'GET',
};

const isQueryString = (method: string) => (
  method === 'GET' ||
  method === 'HEAD' ||
  method === 'DELETE'
);

const buildQueryString = (url: string, params: any) => `${url}?${QueryString.stringify(params)}`;

export const fetch = (url: string, { method, params, token }: ReqArgs = defaultArgs) => {

  let body;

  if (isQueryString(method)) {
    url = buildQueryString(url, params);
  } else {
    body = JSON.stringify(params);
  }

  let headers: { [index: string]: string; } = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Charset': 'utf-8',
  };

  if (token) {
    headers = merge(headers, {
      [token.key]: token.value,
    });
  }

  const req = new Request(url, {
    method: method,
    headers: new Headers(headers),
    body,
  });

  return isomorphicFetch(req)
    .then(response => {
        if (response.ok) {
          return response;
        } else {
          throw new Error('Fetch error status: ' + response.status);
        }
    });
};

export const observableFetch = (url: string, args: ReqArgs) =>
  Observable.fromPromise(fetch(url, args));

export const observableFetchJSON = <T>(url: string, args: ReqArgs): Observable<T> => Observable.fromPromise(
  fetch(url, args)
    .then(response => response.json())
);

export const get = <T>(url: string, args?: Args): Observable<T> => {
  return observableFetchJSON(url, merge(args, {
    method: 'GET',
  }));
};

export const post = (url: string, args?: Args) => {
  return observableFetchJSON(url, merge(args, {
    method: 'POST',
  }));
};

export const put = (url: string, args?: Args) => {
  return observableFetchJSON(url, merge(args, {
    method: 'PUT',
  }));
};

export const remove = (url: string, args?: Args) => {
  return observableFetchJSON(url, merge(args, {
    method: 'DELETE',
  }));
};