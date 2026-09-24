export default defineEventHandler((event) => {
    setResponseHeaders(event, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    })

    // Responde 200 OK a las peticiones preflight del navegador (OPTIONS)
    if (getMethod(event) === 'OPTIONS') {
        event.node.res.statusCode = 200
        return 'OK'
    }
})