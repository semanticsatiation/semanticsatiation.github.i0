let currentLogOutRequest = new AbortController();
let currentSignal = currentLogOutRequest.signal;

export const logOutWithTimeout = async (time = 15000) => {
    currentLogOutRequest.abort();

    currentLogOutRequest = new AbortController();
    currentSignal = currentLogOutRequest.signal;

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
        method: "DELETE",
        signal: currentSignal,
    };

    config.headers['X-CSRF-Token'] = $('meta[name="csrf-token"]').attr('content');

    // Set a timeout limit for the request using `setTimeout`. If the body
    // of this timeout is reached before the request is completed, it will
    // be cancelled.
    const timeout = setTimeout(() => {
        timedOut = true;
        currentLogOutRequest.abort();
    }, time);

    try {
        const response = await fetch("/session", config);
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