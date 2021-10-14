let currentWorkersGetRequest = new AbortController();
let currentWorkersGetSignal = currentWorkersGetRequest.signal;

export const endLastStackedFetch = () => currentWorkersGetRequest.abort();

// SERIOUS
// THIS IS NOT DRY CODE AND I NEED TO FIX IT
// IM REUSING THE FETCH BODY IN MULTIPLE PLACES

// SERIOUS
// also maybe name this secondLayerFetch since i seem to be using this
// function only when there is a fetch already happening on one page
// and i need them both to happen at separate times
export const stackedFetch = async (form, time = 8000) => {
    currentWorkersGetRequest.abort();

    currentWorkersGetRequest = new AbortController();
    currentWorkersGetSignal = currentWorkersGetRequest.signal;

    let aborted;
    let timedOut;

    currentWorkersGetSignal.onabort = () => {
        aborted = true;
    }

    const timeout = setTimeout(() => {
        timedOut = true;
        currentWorkersGetRequest.abort();
    }, time);

    try {
        const response = await fetch(form.url, {
            beforeSend: (xhr) => xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content')),
            headers: {
                "Accept": 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            method: "GET",
            signal: currentWorkersGetSignal,
        });

        const json = await response.json();

        if (response.ok) {
            return Promise.resolve(json);
        }

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