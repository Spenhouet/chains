
/** @param {object} x */
export function jsonResponse(x) {
    return new Response(JSON.stringify(x, null, 2), {
        headers: {
            'content-type': 'application/json; charset=utf-8',
        }
    });
}

/** @param {object} x */
export function minJsonResponse(x) {
    return new Response(JSON.stringify(x), {
        headers: {
            'content-type': 'application/json; charset=utf-8',
        }
    });
}