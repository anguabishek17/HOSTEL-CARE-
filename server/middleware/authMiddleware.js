const jwt = require('jsonwebtoken');

const protect = (roles = []) => {
    return (req, res, next) => {
        try {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return res.status(401).json({ error: 'Not authorized to access this route' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ error: `Role ${req.user.role} is not authorized to access this route` });
            }

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized to access this route' });
        }
    };
};

module.exports = { protect };
