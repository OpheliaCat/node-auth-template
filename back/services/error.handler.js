module.exports = middleware => (_, res, __) => {
    try {
        middleware(_, res, __)
    } catch (error) {
        if (typeof error !== 'object' 
        || error.constructor !== Object 
        || typeof error.status !== 'number' 
        || error.status === 500) 
            res.status(500).json({ 
                error: 'It is a problem on a server side. Please contact an admin.'
            })
        else res.status(error.status).json(error)
    }
}