import { endLastStackedFetch } from "./bug_util";

let currentFetchRequest = new AbortController();
let currentSignal = currentFetchRequest.signal;

export const endLastFetchRequest = () => currentFetchRequest.abort();

export const fetchWithTimeout = async (url, options, time = 15000) => {
    currentFetchRequest.abort();

    currentFetchRequest = new AbortController();
    currentSignal = currentFetchRequest.signal;

    let aborted;
    let timedOut;

    currentSignal.onabort = () => { 
        aborted = true;
    }

    const config = {
        beforeSend: (xhr) => xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content')),
        headers: {
            "Accept": 'application/json',
            'Content-Type': 'application/json',
        },
        ...options,
        signal: currentSignal,
    };

    config.headers['X-CSRF-Token'] = $('meta[name="csrf-token"]').attr('content');

    // Set a timeout limit for the request using `setTimeout`. If the body
    // of this timeout is reached before the request is completed, it will
    // be cancelled.
    const timeout = setTimeout(() => {
        timedOut = true;
        currentFetchRequest.abort();
    }, time);

    try {
        const response = await fetch(url, config);
        const json = await response.json();

        if (response.ok) {
            return Promise.resolve(json);
        }

        // when there are validation errors, we head here
        throw json;
    } catch (errors) {
        let finalErrors = errors;

        if (aborted) {
            if (timedOut) {
                finalErrors = ['Response timed out'];
            } else {
                console.log(errors);
                finalErrors = [];
            }
        }

        return Promise.reject(finalErrors);
    } finally {
        clearTimeout(timeout);
    }
}

export const createObject = (formOpt) => (
    fetchWithTimeout(
        formOpt.url, {
        method: "POST",
        body: JSON.stringify(formOpt.body),
        ...formOpt.requestOptions ? (formOpt.requestOptions) : ({}),
    }, formOpt.setTime)
);

export const updateObject = (formOpt) => (
    // the fetch way of aborting requests accompanied by signal
    fetchWithTimeout(
        formOpt.url, {
        method: "PATCH",
        body: JSON.stringify(formOpt.body),
        ...formOpt.requestOptions ? (formOpt.requestOptions) : ({}),
    }, formOpt.setTime)
);

export const deleteObject = (formOpt) => (
    fetchWithTimeout(
        formOpt.url, {
        method: "DELETE",
        body: JSON.stringify(formOpt.body),
        ...formOpt.requestOptions ? (formOpt.requestOptions) : ({}),
    }, formOpt.setTime)
);


let currentGetRequest = new AbortController();
let currentGetSignal = currentGetRequest.signal;

export const endLastGetRequest = () => currentGetRequest.abort();

export const getWithTimeout = async (url, time = 8000) => {
    currentGetRequest.abort();

    currentGetRequest = new AbortController();
    currentGetSignal = currentGetRequest.signal;

    let aborted;
    let timedOut;

    currentGetSignal.onabort = () => {
        aborted = true;
    }

    const config = {
        beforeSend: (xhr) => xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content')),
        headers: {
            "Accept": 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        },
        method: "GET",
        signal: currentGetSignal,
    };

    // Set a timeout limit for the request using `setTimeout`. If the body
    // of this timeout is reached before the request is completed, it will
    // be cancelled.
    const timeout = setTimeout(() => {
        timedOut = true;
        currentGetRequest.abort();
    }, time);

    try {
        const response = await fetch(url, config);
        const json = await response.json();

        if (response.ok) {
            return Promise.resolve(json);
        }

        // when there are validation errors, we head here
        throw json;
    } catch (errors) {
        let finalErrors = errors;

        if (aborted) {
            if (timedOut) {
                finalErrors = ['Response timed out'];
            } else {
                console.log(errors);
                finalErrors = [];
            }
        }

        return Promise.reject({ errors: finalErrors, aborted: aborted, timedOut: timedOut });
    } finally {
        clearTimeout(timeout);
    }
}

export const filterObjects = (formOpt) => getWithTimeout(formOpt.url);


export const endAllRequests = () => {
    endLastGetRequest();
    endLastFetchRequest();
    endLastStackedFetch();
}