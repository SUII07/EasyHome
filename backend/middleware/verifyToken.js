import jwt from 'jsonwebtoken'

export const isAdmin = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token:", token); // Debugging
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded;
    next();
  });
};
  
  export const isServiceProvider = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (decoded.role !== 'serviceprovider') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
  };
  
  export const isCustomer = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (decoded.role !== 'customer') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
  };
